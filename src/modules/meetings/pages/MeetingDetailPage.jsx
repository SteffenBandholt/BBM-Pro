import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  buildMeetingTopTree,
  findMeetingTopNodeById,
  canMoveMeetingTop,
} from '../data/meetingTopModel.js';
import { clampTopLongtextInput, clampTopTitleInput } from '../../../services/tops/topTextLimits.js';
import {
  listMeetingTops,
  createTop as createTopSvc,
  updateMeetingTop as updateMeetingTopSvc,
  deleteTop as deleteTopSvc,
  moveTop as moveTopSvc,
} from '../services/meetingTopsService.js';
import {
  updateMeetingKeyword as updateMeetingKeywordSvc,
} from '../services/meetingsService.js';
import { getMeeting } from '../../../services/domain/meetingService.js';
import ProtocolActionBar from '../components/ProtocolActionBar.jsx';
import ProtocolBottomToolBar from '../components/ProtocolBottomToolBar.jsx';
import ProtocolEditorPanel from '../components/ProtocolEditorPanel.jsx';
import ProtocolTopList from '../components/ProtocolTopList.jsx';
import { closeMeeting as closeMeetingService } from '../services/meetingCloseService.js';
import { listProjectFirms } from '../services/projectFirmsService.js';
import {
  listMeetingParticipantPool,
  removeMeetingParticipant,
  setMeetingParticipant,
} from '../services/meetingParticipantsService.js';
import { generateProtocolPdf, generateTodoPdf, generateToplistPdf } from '../../../services/print/printController.js';

const STATUS_OPTIONS = ['offen', 'in arbeit', 'blockiert', 'verzug', 'erledigt'];
const TITLE_DEBOUNCE_MS = 350;
const LONGTEXT_DEBOUNCE_MS = 450;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function mapRowToUi(row) {
  const status = String(row.status || 'offen').toLowerCase();
  return {
    id: row.id,
    title: row.title || '',
    longtext: row.longtext || '',
    dueDate: row.due_date || '',
    createdAt: row.top_created_at || '',
    status: STATUS_OPTIONS.includes(status) ? status : 'offen',
    isCarriedOver: !!row.is_carried_over,
    isHidden: !!row.is_hidden,
    isTrashed: !!row.is_trashed,
    isTouched: !!row.is_touched,
    isImportant: !!row.is_important,
    level: Number(row.level) || 1,
    parentTopId: row.parent_top_id ?? null,
    number: Number(row.number) || 1,
    projectId: row.project_id,
    responsibleLabel: row.responsible_label || '',
    responsibleId: row.responsible_id || null,
  };
}

function buildChildCount(tops) {
  const counts = new Map();
  tops.forEach((t) => {
    const parentId = t.parentTopId ?? null;
    counts.set(parentId, (counts.get(parentId) || 0) + 1);
  });
  return counts;
}

export default function MeetingDetailPage() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState({
    id: meetingId,
    isClosed: false,
    project_id: null,
    meeting_index: null,
    protocol_label: 'Protokoll',
    title: '',
    created_at: null,
  });
  const [tops, setTops] = useState([]);
  const [firms, setFirms] = useState([]);
  const [participantPool, setParticipantPool] = useState([]);
  const [selectedTopId, setSelectedTopId] = useState(null);
  const [userSelectedTop, setUserSelectedTop] = useState(false);
  const [moveMode, setMoveMode] = useState(false);
  const [editorMode, setEditorMode] = useState('edit');
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error
  const titleDebounce = useMemo(() => ({ timer: null, lastSent: null }), []);
  const longtextDebounce = useMemo(() => ({ timer: null, lastSent: null }), []);
  const textSaveQueue = useMemo(() => ({ chain: Promise.resolve() }), []);
  const [editorDraft, setEditorDraft] = useState({
    title: '',
    longtext: '',
    dueDate: '',
    status: 'offen',
    responsibleId: '',
    isImportant: false,
    level: 1,
    parentTopId: null,
  });

  const loadMeetingContext = async (projectId) => {
    if (!projectId) return;
    const firmRows = await listProjectFirms(projectId);
    setFirms(firmRows);
    const poolRows = await listMeetingParticipantPool(meetingId);
    setParticipantPool(poolRows);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const m = await getMeeting(meetingId);
        if (m) {
          setMeeting({
            id: m.id,
            isClosed: !!m.is_closed,
            project_id: m.project_id,
            meeting_index: m.meeting_index ?? null,
            protocol_label: m.protocol_label || 'Protokoll',
            title: m.title || '',
            created_at: m.created_at || null,
          });
          await loadMeetingContext(m.project_id);
          const rows = await listMeetingTops(meetingId);
          setTops(rows.map(mapRowToUi));
        } else {
          setTops([]);
        }
      } catch (err) {
        console.error('[meeting] load failed', err);
        setTops([]);
      }
    };
    load();
  }, [meetingId]);

  useEffect(() => {
    if (titleDebounce.timer) {
      clearTimeout(titleDebounce.timer);
      titleDebounce.timer = null;
    }
    titleDebounce.lastSent = null;
    if (longtextDebounce.timer) {
      clearTimeout(longtextDebounce.timer);
      longtextDebounce.timer = null;
    }
    longtextDebounce.lastSent = null;
    setSaveState('idle');
  }, [selectedTopId, editorMode, titleDebounce, longtextDebounce]);

  const childCount = useMemo(() => buildChildCount(tops), [tops]);
  const normalizedTops = useMemo(
    () => tops.map((t) => ({ ...t, childCount: childCount.get(t.id) || 0 })),
    [tops, childCount],
  );

  const topTree = useMemo(() => buildMeetingTopTree(normalizedTops), [normalizedTops]);
  const selectedNode = useMemo(
    () => (selectedTopId ? findMeetingTopNodeById(topTree, selectedTopId) : null),
    [selectedTopId, topTree],
  );

  const selectedTopFlat = useMemo(
    () => normalizedTops.find((t) => String(t.id) === String(selectedTopId)) || null,
    [normalizedTops, selectedTopId],
  );

  const selectedTop = useMemo(() => {
    if (selectedNode) {
      return { ...selectedNode, childCount: childCount.get(selectedNode.id) || 0 };
    }
    if (selectedTopFlat) {
      return { ...selectedTopFlat, childCount: childCount.get(selectedTopFlat.id) || 0 };
    }
    return null;
  }, [selectedNode, selectedTopFlat, childCount]);

  const protocolLabelName = 'Protokoll';

  const protocolLabelMeta = useMemo(() => {
    const sourceDate = meeting.created_at ? new Date(meeting.created_at) : new Date();
    const date = new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(sourceDate);
    const index = meeting.meeting_index ?? '';
    const suffix = meeting.isClosed ? ' - read only !' : '';
    return `#${index} - ${date}${suffix}`;
  }, [meeting.created_at, meeting.isClosed, meeting.meeting_index]);

  const topLabel = useMemo(() => {
    if (editorMode === 'create-title') return 'Neuen Titel anlegen';
    if (editorMode === 'create-child' || editorMode === 'create-sibling') return 'Neuen TOP anlegen';
    if (selectedTop) return `TOP ${selectedTop.displayNumber} bearbeiten`;
    return 'TOP bearbeiten';
  }, [editorMode, selectedTop]);

  const isMeetingClosed = !!meeting.isClosed;
  const selectedHasChildren = selectedTop ? selectedTop.childCount > 0 : false;
  const canDelete = Boolean(selectedTop && !isMeetingClosed && !selectedTop.isCarriedOver && !selectedHasChildren);
  const canMove = Boolean(selectedTop && !isMeetingClosed && !selectedTop.isCarriedOver && !selectedHasChildren);
  const canCreateTitle = Boolean(!isMeetingClosed && meeting.project_id);
  const canCreateTop = Boolean(!isMeetingClosed && selectedTop && selectedTop.level < 4);
  const selectedParticipantCount = useMemo(
    () => participantPool.filter((participant) => participant.isParticipant).length,
    [participantPool],
  );

  const commitEditorPatch = async (topId, patch) => {
    if (!topId || isMeetingClosed || !patch || !Object.keys(patch).length) {
      return;
    }
    setSaveState('saving');
    try {
      await updateMeetingTopSvc({
        meetingId,
        topId,
        patch,
      });
      setSaveState('saved');
      await reloadTops();
    } catch (err) {
      console.error('[tops] autosave failed', err);
      setSaveState('error');
    }
  };

  const queueTextEditorPatch = (topId, patch) => {
    textSaveQueue.chain = textSaveQueue.chain
      .catch(() => {})
      .then(() => commitEditorPatch(topId, patch));
    return textSaveQueue.chain;
  };

  const handleEditorFieldChange = (field, value) => {
    let nextValue = value;
    if (field === 'title') {
      nextValue = clampTopTitleInput(value);
    } else if (field === 'longtext') {
      nextValue = clampTopLongtextInput(value);
    }

    setEditorDraft((currentDraft) => ({ ...currentDraft, [field]: nextValue }));

    // Auto-save nur im Edit-Modus
    if (editorMode !== 'edit' || !selectedTop || isMeetingClosed) {
      return;
    }
    const activeTopId = selectedTop.id;

    const scheduleDebounced = (debounceRef, delayMs, buildPatch, getComparableValue) => {
      if (debounceRef.timer) clearTimeout(debounceRef.timer);
      debounceRef.timer = setTimeout(() => {
        const patch = buildPatch();
        const comparableValue = getComparableValue();
        if (debounceRef.lastSent === comparableValue) return;
        debounceRef.lastSent = comparableValue;
        void queueTextEditorPatch(activeTopId, patch);
      }, delayMs);
    };

    if (field === 'status') {
      if ((selectedTop.status || 'offen') === nextValue) return;
      void commitEditorPatch(activeTopId, { status: nextValue });
    } else if (field === 'dueDate') {
      const val = nextValue ? String(nextValue).trim() : null;
      if ((selectedTop.dueDate || null) === val) return;
      void commitEditorPatch(activeTopId, { dueDate: val });
    } else if (field === 'isImportant') {
      if (Boolean(selectedTop.isImportant) === Boolean(nextValue)) return;
      void commitEditorPatch(activeTopId, { is_important: nextValue });
    } else if (field === 'responsibleId') {
      if (String(selectedTop.responsibleId || '') === String(nextValue || '')) return;
      const firm = firms.find((f) => String(f.id) === String(nextValue));
      void commitEditorPatch(activeTopId, {
        responsible_kind: nextValue ? 'firm' : null,
        responsible_id: nextValue || null,
        responsible_label: firm ? firm.name : null,
      });
    } else if (field === 'title') {
      scheduleDebounced(titleDebounce, TITLE_DEBOUNCE_MS, () => {
        const nextTitle = nextValue || '';
        if ((selectedTop.title || '') === nextTitle) return null;
        return { title: nextTitle };
      }, () => nextValue || '');
    } else if (field === 'longtext') {
      scheduleDebounced(longtextDebounce, LONGTEXT_DEBOUNCE_MS, () => {
        const nextLongtext = nextValue || '';
        if ((selectedTop.longtext || '') === nextLongtext) return null;
        return { longtext: nextLongtext };
      }, () => nextValue || '');
    }
  };

  const handleEditorFieldBlur = (field, value) => {
    if (editorMode !== 'edit' || !selectedTop || isMeetingClosed) return;
    const activeTopId = selectedTop.id;
    if (field === 'title') {
      const nextTitle = value || '';
      if (titleDebounce.timer) clearTimeout(titleDebounce.timer);
      if (titleDebounce.lastSent === nextTitle) return;
      if ((selectedTop.title || '') === nextTitle) return;
      titleDebounce.lastSent = nextTitle;
      void queueTextEditorPatch(activeTopId, { title: nextTitle });
    } else if (field === 'longtext') {
      if (longtextDebounce.timer) clearTimeout(longtextDebounce.timer);
      if (longtextDebounce.lastSent === (value || '')) return;
      if ((selectedTop.longtext || '') === (value || '')) return;
      longtextDebounce.lastSent = value || '';
      void queueTextEditorPatch(activeTopId, { longtext: value || '' });
    }
  };

  const reloadTops = async () => {
    const rows = await listMeetingTops(meetingId);
    setTops(rows.map(mapRowToUi));
  };

  const startEditTop = (top) => {
    if (!top) return;
    setSelectedTopId(top.id);
    setEditorMode('edit');
    setEditorDraft({
      level: top.level,
      parentTopId: top.parentTopId ?? null,
      title: top.title || '',
      longtext: top.longtext || '',
      dueDate: top.dueDate || '',
      status: top.status || 'offen',
      responsibleId: top.responsibleId || '',
      isImportant: Boolean(top.isImportant),
    });
  };

  const startCreateTitle = () => {
    if (!canCreateTitle) {
      alert('Neuer Titel ist derzeit nicht erlaubt (Protokoll geschlossen oder Projekt fehlt).');
      return;
    }
    setSelectedTopId(null);
    setUserSelectedTop(false);
    setEditorMode('create-title');
    setEditorDraft({
      level: 1,
      parentTopId: null,
      title: '',
      longtext: '',
      dueDate: '',
      status: 'offen',
      responsibleId: '',
      isImportant: false,
    });
  };

  const startCreateTop = () => {
    if (!selectedTop) {
      alert('Bitte zuerst einen TOP auswaehlen.');
      return;
    }
    if (isMeetingClosed) {
      alert('Protokoll ist geschlossen.');
      return;
    }

    const activeLevel = Number(selectedTop.level) || 1;
    const nextLevel = activeLevel + 1;

    if (userSelectedTop) {
      if (nextLevel > 4) {
        alert('Maximale TOP-Tiefe erreicht (Level 4).');
        return;
      }
      setEditorMode('create-child');
      setEditorDraft({
        level: nextLevel,
        parentTopId: selectedTop.id,
        title: '',
        longtext: '',
        dueDate: todayIso(),
        status: 'offen',
        responsibleId: '',
        isImportant: false,
      });
    } else {
      if (activeLevel < 2) {
        setEditorMode('create-child');
        setEditorDraft({
          level: 2,
          parentTopId: selectedTop.id,
          title: '',
          longtext: '',
          dueDate: todayIso(),
          status: 'offen',
          responsibleId: '',
          isImportant: false,
        });
        return;
      }
      if (activeLevel > 4) {
        alert('Maximale TOP-Tiefe erreicht (Level 4).');
        return;
      }
      setEditorMode('create-sibling');
      setEditorDraft({
        level: activeLevel,
        parentTopId: selectedTop.parentTopId ?? null,
        title: '',
        longtext: '',
        dueDate: todayIso(),
        status: 'offen',
        responsibleId: '',
        isImportant: false,
      });
    }
  };

  const handleSaveEditor = () => {
    const run = async () => {
      if (isMeetingClosed) {
        alert('Protokoll ist geschlossen.');
        return;
      }
      const rawTitle = editorDraft.title || '';
      if (!rawTitle.trim()) {
        alert('Titel darf nicht leer sein.');
        return;
      }

      if (editorMode === 'edit' && selectedTop) {
        const patch = {
          title: selectedTop.isCarriedOver ? undefined : rawTitle,
          longtext: editorDraft.longtext,
          dueDate: editorDraft.dueDate,
          status: editorDraft.status,
          responsible_kind: editorDraft.responsibleId ? 'firm' : null,
          responsible_id: editorDraft.responsibleId || null,
          is_important: editorDraft.isImportant,
        };
        try {
          await updateMeetingTopSvc({
            meetingId,
            topId: selectedTop.id,
            patch,
          });
        } catch (err) {
          alert(err?.message || 'Speichern fehlgeschlagen.');
          return;
        }
      } else {
        if (!meeting.project_id) {
          alert('Projekt-ID fehlt, Anlegen nicht moeglich.');
          return;
        }

        const parentTopId = editorDraft.parentTopId ?? null;
        const level = editorDraft.level || 1;

        try {
          const created = await createTopSvc({
            projectId: meeting.project_id,
            meetingId,
            parentTopId,
            level,
            title: rawTitle,
          });
          if (created?.id) {
            setSelectedTopId(created.id);
            setUserSelectedTop(false);
          }
        } catch (err) {
          alert(err?.message || 'Anlegen fehlgeschlagen.');
          return;
        }
      }
      await reloadTops();
      setSaveState('saved');
      setEditorMode('edit');
    };
    void run();
  };

  const handleCancelEdit = () => {
    if (selectedTop) {
      startEditTop(selectedTop);
      return;
    }
    setEditorMode('edit');
    setEditorDraft({
      title: '',
      longtext: '',
      dueDate: '',
      status: 'offen',
      responsibleId: '',
      isImportant: false,
      level: 1,
      parentTopId: null,
    });
  };

  const handleDeleteSelectedTop = () => {
    if (!selectedTop) return;
    if (!canDelete) {
      alert('Loeschen ist nicht erlaubt (uebernommenes Element, Kinder vorhanden oder Protokoll geschlossen).');
      return;
    }
    const confirmed = window.confirm('TOP wirklich loeschen?');
    if (!confirmed) return;
    const run = async () => {
      try {
        await deleteTopSvc({ meetingId, topId: selectedTop.id });
        await reloadTops();
        setSelectedTopId(null);
      } catch (err) {
        alert(err?.message || 'Loeschen fehlgeschlagen.');
      }
    };
    void run();
  };

  const handleMoveSelectedTop = () => {
    if (!selectedTop || !canMove) return;
    setMoveMode((current) => !current);
  };

  const handleTopSelect = (topId) => {
    // Move-mode: interpret click as target
    if (moveMode && selectedTop && String(selectedTop.id) !== String(topId)) {
      const targetParentId = topId;
      if (!canMoveMeetingTop(normalizedTops, selectedTop.id, isMeetingClosed, targetParentId)) {
        alert('Schieben: Ziel ungueltig.');
        return;
      }
      const run = async () => {
        try {
          await moveTopSvc({ topId: selectedTop.id, targetParentId });
          await reloadTops();
          setSelectedTopId(selectedTop.id);
        } catch (err) {
          alert(err?.message || 'Schieben fehlgeschlagen.');
        } finally {
          setMoveMode(false);
        }
      };
      void run();
      return;
    }

    setMoveMode(false);
    setSelectedTopId(topId);
    setUserSelectedTop(true);
    setEditorMode('edit');

    const top = findMeetingTopNodeById(topTree, topId);
    if (top) {
      startEditTop({
        ...top,
        childCount: childCount.get(top.id) || 0,
      });
    }
  };

  const handleEndProtocol = () => {
    const run = async () => {
      const res = await closeMeetingService(meetingId);
      if (!res.ok) {
        if (res.errorCode === 'NUM_GAP') {
          alert('Protokoll kann nicht geschlossen werden: Nummernluecke gefunden.');
        } else if (res.error) {
          alert(res.error);
        } else {
          alert('Schliessen fehlgeschlagen.');
        }
        return;
      }
      const projectId = res.meeting?.project_id || meeting.project_id || null;
      if (projectId) {
        navigate(`/projects/${projectId}/meetings`, { replace: true });
        return;
      }
      navigate('/projects', { replace: true });
    };
    void run();
  };

  const handleClose = () => navigate(-1);

  const persistMeetingKeyword = async (nextKeywordRaw) => {
    const nextKeyword = String(nextKeywordRaw || '').trim();
    try {
      const updatedMeeting = await updateMeetingKeywordSvc(meetingId, nextKeyword);
      setMeeting((current) => ({
        ...current,
        title: updatedMeeting.title || '',
        meeting_index: updatedMeeting.meeting_index ?? current.meeting_index,
        created_at: updatedMeeting.created_at || current.created_at,
      }));
    } catch (err) {
      alert(err?.message || 'Schlagwort konnte nicht gespeichert werden.');
      const freshMeeting = await getMeeting(meetingId);
      if (freshMeeting) {
        setMeeting((current) => ({
          ...current,
          title: freshMeeting.title || '',
          meeting_index: freshMeeting.meeting_index ?? current.meeting_index,
          created_at: freshMeeting.created_at || current.created_at,
        }));
      }
      throw err;
    }
  };

  const handleToggleParticipant = async (participant, field, value) => {
    if (field === 'isParticipant') {
      if (value) {
        await setMeetingParticipant({
          meetingId,
          personKind: participant.personKind,
          personId: participant.personId,
          firmId: participant.firmId,
          is_present: true,
          is_in_distribution: !!participant.hasEmail,
        });
      } else {
        await removeMeetingParticipant({
          meetingId,
          personKind: participant.personKind,
          personId: participant.personId,
          firmId: participant.firmId,
        });
      }
    } else {
      await setMeetingParticipant({
        meetingId,
        personKind: participant.personKind,
        personId: participant.personId,
        firmId: participant.firmId,
        is_present: field === 'is_present' ? value : participant.is_present || false,
        is_in_distribution: participant.hasEmail
          ? (field === 'is_in_distribution' ? value : participant.is_in_distribution || false)
          : false,
      });
    }

    setParticipantPool(await listMeetingParticipantPool(meetingId));
  };

  const handleDownloadPdf = () => {
    const run = async () => {
      try {
        const pdfBytes = await generateProtocolPdf(meeting.project_id, meetingId);
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Protokoll-${meetingId}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error(err);
        alert('PDF konnte nicht erzeugt werden.');
      }
    };
    void run();
  };

  const handleDownloadTodoPdf = () => {
    const run = async () => {
      try {
        const pdfBytes = await generateTodoPdf(meeting.project_id, meetingId);
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ToDo-${meetingId}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error(err);
        alert('ToDo-PDF konnte nicht erzeugt werden.');
      }
    };
    void run();
  };

  const handleDownloadToplistPdf = () => {
    const run = async () => {
      try {
        const pdfBytes = await generateToplistPdf(meeting.project_id, meetingId);
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Topliste-${meetingId}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error(err);
        alert('Toplisten-PDF konnte nicht erzeugt werden.');
      }
    };
    void run();
  };

  return (
    <section className="page-section protocol-page">
      <div className="protocol-paper">
        <ProtocolActionBar
          protocolLabelName={protocolLabelName}
          protocolLabelMeta={protocolLabelMeta}
          keyword={meeting.title || ''}
          onKeywordSave={persistMeetingKeyword}
          isClosed={meeting.isClosed}
          onEndProtocol={handleEndProtocol}
          onClose={handleClose}
        />

        <section className="project-participants__panel protocol-participants">
          <div className="protocol-participants__header">
            <div>
              <h2>Teilnehmer</h2>
              <p>Projektmitarbeiter-Pool fuer diese Besprechung</p>
            </div>
            <span className="project-participants__badge">
              {selectedParticipantCount} / {participantPool.length} Teilnehmer
            </span>
          </div>

          {participantPool.length === 0 ? (
            <p>Im Projekt sind noch keine Mitarbeiter verfuegbar.</p>
          ) : (
            <ul className="project-participants__employees">
              {participantPool.map((participant) => (
                <li key={`${participant.personKind}:${participant.personId}`}>
                  <article className="project-participants__employee-card protocol-participants__card">
                    <div>
                      <p className="project-participants__employee-name">{participant.personName}</p>
                      <p className="project-participants__employee-role">
                        {participant.firmName} - {participant.source === 'global' ? 'Globaler Mitarbeiter' : 'Projektinterner Mitarbeiter'}
                      </p>
                    </div>

                    <div className="protocol-participants__toggles">
                      <label className="protocol-participants__toggle">
                        <input
                          type="checkbox"
                          checked={participant.isParticipant}
                          onChange={(event) => {
                            void handleToggleParticipant(participant, 'isParticipant', event.target.checked);
                          }}
                          disabled={isMeetingClosed}
                        />
                        <span>Teilnehmer</span>
                      </label>

                      <label className="protocol-participants__toggle">
                        <input
                          type="checkbox"
                          checked={!!participant.is_present}
                          onChange={(event) => {
                            void handleToggleParticipant(participant, 'is_present', event.target.checked);
                          }}
                          disabled={isMeetingClosed || !participant.isParticipant}
                        />
                        <span>Anwesend</span>
                      </label>

                      <label className="protocol-participants__toggle">
                        <input
                          type="checkbox"
                          checked={!!participant.is_in_distribution}
                          onChange={(event) => {
                            void handleToggleParticipant(participant, 'is_in_distribution', event.target.checked);
                          }}
                          disabled={isMeetingClosed || !participant.isParticipant || !participant.hasEmail}
                        />
                        <span>Verteiler</span>
                      </label>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="protocol-layout">
          <div className="protocol-main">
            <ProtocolTopList tops={topTree} selectedTopId={selectedTopId} onSelectTop={handleTopSelect} />
          </div>

          <div className="protocol-bottom-area">
            <ProtocolEditorPanel
              title={topLabel}
              draft={editorDraft}
              saveState={saveState}
              responsibleOptions={firms}
              onFieldChange={handleEditorFieldChange}
              onFieldBlur={handleEditorFieldBlur}
              onSave={handleSaveEditor}
              onDelete={handleDeleteSelectedTop}
              onCancel={handleCancelEdit}
              onToggleImportant={(checked) => handleEditorFieldChange('isImportant', checked)}
              isReadOnly={isMeetingClosed}
              canDelete={canDelete}
              titleLocked={selectedTop ? selectedTop.isCarriedOver && editorMode === 'edit' : false}
              toolbar={(
                <ProtocolBottomToolBar
                  onStartTitleCreate={startCreateTitle}
                  onStartTopCreate={startCreateTop}
                  canCreateTitle={canCreateTitle}
                  canCreateTop={canCreateTop}
                  canMove={canMove}
                  onToggleMove={handleMoveSelectedTop}
                  moveMode={moveMode}
                />
              )}
            />
            <div className="protocol-print-actions">
              <button type="button" className="button button--secondary button--sm" onClick={handleDownloadPdf}>
                PDF erzeugen
              </button>
              <button type="button" className="button button--secondary button--sm" onClick={handleDownloadTodoPdf}>
                ToDo-PDF
              </button>
              <button type="button" className="button button--secondary button--sm" onClick={handleDownloadToplistPdf}>
                Topliste-PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
