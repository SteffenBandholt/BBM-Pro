import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  buildMeetingTopTree,
  findMeetingTopNodeById,
  canMoveMeetingTop,
  getMeetingTopMoveTargetOptions,
} from '../data/meetingTopModel.js';
import {
  listMeetingTops,
  createTop as createTopSvc,
  updateMeetingTop as updateMeetingTopSvc,
  deleteTop as deleteTopSvc,
  moveTop as moveTopSvc,
} from '../services/meetingTopsService.js';
import { getMeeting } from '../../../services/domain/meetingService.js';
import ProtocolActionBar from '../components/ProtocolActionBar.jsx';
import ProtocolBottomToolBar from '../components/ProtocolBottomToolBar.jsx';
import ProtocolEditorPanel from '../components/ProtocolEditorPanel.jsx';
import ProtocolTopList from '../components/ProtocolTopList.jsx';
import { closeMeeting as closeMeetingService } from '../services/meetingCloseService.js';
import { listProjectFirms } from '../services/projectFirmsService.js';
import {
  listMeetingParticipants,
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
    responsible: row.responsible_label || '',
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
  const [meeting, setMeeting] = useState({ id: meetingId, isClosed: false, project_id: null });
  const [tops, setTops] = useState([]);
  const [firms, setFirms] = useState([]);
  const [participants, setParticipants] = useState([]);
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
    responsible: '',
    responsibleId: '',
    isImportant: false,
    level: 1,
    parentTopId: null,
  });

  const loadFirmsAndParticipants = async (projectId) => {
    if (!projectId) return;
    const firmRows = await listProjectFirms(projectId);
    setFirms(firmRows);
    const parts = await listMeetingParticipants(meetingId);
    setParticipants(parts);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const m = await getMeeting(meetingId);
        if (m) {
          setMeeting({ id: m.id, isClosed: !!m.is_closed, project_id: m.project_id });
          await loadFirmsAndParticipants(m.project_id);
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

  const protocolLabel = useMemo(() => {
    const date = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date());
    return `#${meetingId} - ${date}`;
  }, [meetingId]);

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
    setEditorDraft((currentDraft) => ({ ...currentDraft, [field]: value }));

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
      if ((selectedTop.status || 'offen') === value) return;
      void commitEditorPatch(activeTopId, { status: value });
    } else if (field === 'dueDate') {
      const val = value ? String(value).trim() : null;
      if ((selectedTop.dueDate || null) === val) return;
      void commitEditorPatch(activeTopId, { dueDate: val });
    } else if (field === 'isImportant') {
      if (Boolean(selectedTop.isImportant) === Boolean(value)) return;
      void commitEditorPatch(activeTopId, { is_important: value });
    } else if (field === 'responsibleId') {
      if (String(selectedTop.responsibleId || '') === String(value || '')) return;
      const firm = firms.find((f) => String(f.id) === String(value));
      void commitEditorPatch(activeTopId, {
        responsible_kind: value ? 'firm' : null,
        responsible_id: value || null,
        responsible_label: firm ? firm.name : null,
      });
    } else if (field === 'title') {
      scheduleDebounced(titleDebounce, TITLE_DEBOUNCE_MS, () => {
        const nextTitle = (value || '').trim();
        if ((selectedTop.title || '') === nextTitle) return null;
        return { title: nextTitle };
      }, () => (value || '').trim());
    } else if (field === 'longtext') {
      scheduleDebounced(longtextDebounce, LONGTEXT_DEBOUNCE_MS, () => {
        const nextLongtext = value || '';
        if ((selectedTop.longtext || '') === nextLongtext) return null;
        return { longtext: nextLongtext };
      }, () => value || '');
    }
  };

  const handleEditorFieldBlur = (field, value) => {
    if (editorMode !== 'edit' || !selectedTop || isMeetingClosed) return;
    const activeTopId = selectedTop.id;
    const trimmed = typeof value === 'string' ? value.trim() : value;
    if (field === 'title') {
      if (titleDebounce.timer) clearTimeout(titleDebounce.timer);
      if (titleDebounce.lastSent === (trimmed || '')) return;
      if ((selectedTop.title || '') === (trimmed || '')) return;
      titleDebounce.lastSent = trimmed || '';
      void queueTextEditorPatch(activeTopId, { title: trimmed || '' });
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
      responsible: top.responsibleLabel || top.responsible || '',
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
      responsible: '',
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
        responsible: '',
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
          responsible: '',
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
        responsible: '',
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
      const trimmedTitle = (editorDraft.title || '').trim();
      if (!trimmedTitle) {
        alert('Titel darf nicht leer sein.');
        return;
      }

      if (editorMode === 'edit' && selectedTop) {
        const patch = {
          title: selectedTop.isCarriedOver ? undefined : trimmedTitle,
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
            title: trimmedTitle,
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
      responsible: '',
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
      setMeeting((current) => ({ ...current, isClosed: true }));
    };
    void run();
  };

  const handleClose = () => navigate(-1);

  const handleToggleParticipant = async (firmId, field, value) => {
    const current = participants.find((p) => String(p.firm_id) === String(firmId));
    await setMeetingParticipant({
      meetingId,
      firmId,
      is_present: field === 'is_present' ? value : current?.is_present || 0,
      is_in_distribution: field === 'is_in_distribution' ? value : current?.is_in_distribution || 0,
    });
    setParticipants(await listMeetingParticipants(meetingId));
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
          protocolLabel={protocolLabel}
          isClosed={meeting.isClosed}
          onEndProtocol={handleEndProtocol}
          onClose={handleClose}
        />

        <div className="protocol-layout">
          <div className="protocol-main">
            <ProtocolTopList tops={topTree} selectedTopId={selectedTopId} onSelectTop={handleTopSelect} />

            <div className="protocol-participants">
              <h3>Teilnehmer (Firmen)</h3>
              {firms.length === 0 ? (
                <p>Keine Firmen vorhanden.</p>
              ) : (
                <ul>
                  {firms.map((f) => {
                    const entry = participants.find((p) => String(p.firm_id) === String(f.id));
                    const present = entry ? !!entry.is_present : false;
                    const dist = entry ? !!entry.is_in_distribution : false;
                    return (
                      <li key={f.id} className="participant-row">
                        <span>{f.name}</span>
                        <label>
                          <input
                            type="checkbox"
                            checked={present}
                            onChange={(e) => handleToggleParticipant(f.id, 'is_present', e.target.checked)}
                          />
                          anwesend
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            checked={dist}
                            onChange={(e) => handleToggleParticipant(f.id, 'is_in_distribution', e.target.checked)}
                          />
                          Verteiler
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
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
