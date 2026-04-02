import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { buildMeetingTopTree, findMeetingTopNodeById } from '../data/meetingTopModel.js';
import {
  listMeetingTops,
  createTop as createTopSvc,
  updateMeetingTop as updateMeetingTopSvc,
  deleteTop as deleteTopSvc,
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

function formatProtocolDate(date) {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function mapRowToUi(row) {
  return {
    id: row.id,
    title: row.title || '',
    longtext: row.longtext || '',
    dueDate: row.due_date || '',
    createdAt: row.top_created_at || '',
    ampel: row.status === 'erledigt' ? 'grün' : 'gelb',
    responsible: row.responsible_label || '',
    responsibleId: row.responsible_id || null,
    status: row.status || 'offen',
    isCarriedOver: !!row.is_carried_over,
    isHidden: !!row.is_hidden,
    isTrashed: !!row.is_trashed,
    isTouched: !!row.is_touched,
    isImportant: !!row.is_important,
    level: row.level,
    parentTopId: row.parent_top_id,
    number: row.number,
    projectId: row.project_id,
  };
}

export default function MeetingDetailPage() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const protocolDate = formatProtocolDate(new Date());
  const [meeting, setMeeting] = useState({ id: meetingId, isClosed: false, project_id: null });
  const [tops, setTops] = useState([]);
  const [firms, setFirms] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [selectedTopId, setSelectedTopId] = useState(null);
  const [editorMode, setEditorMode] = useState('edit');
  const [editorDraft, setEditorDraft] = useState({
    title: '',
    longtext: '',
    dueDate: '',
    ampel: 'gelb',
    status: 'offen',
    responsible: '',
    responsibleId: '',
    isImportant: false,
    level: 1,
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

  const topTree = useMemo(() => buildMeetingTopTree(tops), [tops]);
  const selectedTop = useMemo(
    () => (selectedTopId ? findMeetingTopNodeById(topTree, selectedTopId) : null),
    [selectedTopId, topTree],
  );

  const topLabel = selectedTop
    ? `TOP ${selectedTop.displayNumber} bearbeiten`
    : editorMode === 'create-child'
      ? 'Neuen Unterpunkt bearbeiten'
      : 'TOP bearbeiten';
  const protocolLabel = `#${meetingId} - ${protocolDate}`;

  const startEditTop = (top) => {
    setSelectedTopId(top.id);
    setEditorMode('edit');
    setEditorDraft({
      level: top.level,
      title: top.title,
      longtext: top.longtext || '',
      dueDate: top.dueDate || '',
      ampel: top.status === 'erledigt' ? 'grün' : top.isImportant ? 'rot' : 'gelb',
      status: top.status || 'offen',
      responsible: top.responsible || '',
      responsibleId: top.responsibleId || '',
      isImportant: Boolean(top.isImportant),
    });
  };

  const startCreateRootTop = () => {
    setSelectedTopId(null);
    setEditorMode('create-root');
    setEditorDraft({
      title: '',
      longtext: '',
      dueDate: '',
      ampel: 'gelb',
      status: 'offen',
      responsible: '',
      responsibleId: '',
      isImportant: false,
      level: 1,
    });
  };

  const startCreateChildTop = () => {
    if (!selectedTop) return;
    if (Number(selectedTop.level) !== 1) return; // TOP nur unter Titel
    setEditorMode('create-child');
    setEditorDraft({
      title: '',
      longtext: '',
      dueDate: '',
      ampel: 'gelb',
      status: 'offen',
      responsible: '',
      responsibleId: '',
      isImportant: false,
      level: selectedTop.level + 1,
      parentTopId: selectedTop.id ?? null,
    });
  };

  const startCreateSubChildTop = () => {
    if (!selectedTop) return;
    const lvl = Number(selectedTop.level);
    if (lvl < 1 || lvl >= 4) return;
    setEditorMode('create-child');
    setEditorDraft({
      title: '',
      longtext: '',
      dueDate: '',
      ampel: 'gelb',
      status: 'offen',
      responsible: '',
      responsibleId: '',
      isImportant: false,
      level: lvl + 1,
      parentTopId: selectedTop.id ?? null,
    });
  };

  const handleEditorFieldChange = (field, value) => {
    setEditorDraft((currentDraft) => ({ ...currentDraft, [field]: value }));
  };

  const reloadTops = async () => {
    const rows = await listMeetingTops(meetingId);
    setTops(rows.map(mapRowToUi));
  };

  const handleSaveEditor = () => {
    const run = async () => {
      if (editorMode === 'edit' && selectedTop) {
        await updateMeetingTopSvc({
          meetingId,
          topId: selectedTop.id,
          patch: {
            title: editorDraft.title.trim(),
            longtext: editorDraft.longtext,
            dueDate: editorDraft.dueDate,
            status: editorDraft.status,
            responsible_kind: editorDraft.responsibleId ? 'firm' : null,
            responsible_id: editorDraft.responsibleId || null,
            is_important: editorDraft.isImportant,
          },
        });
      } else {
        if (!meeting.project_id) return;

        if (editorMode === 'create-root') {
          const created = await createTopSvc({
            projectId: meeting.project_id,
            meetingId,
            parentTopId: null,
            level: 1,
            title: editorDraft.title.trim(),
          });
          if (created?.id) setSelectedTopId(created.id);
        } else if (editorMode === 'create-child') {
          if (!selectedTop) return;
          const level = Math.min(4, editorDraft.level || (Number(selectedTop.level) || 1) + 1);
          const created = await createTopSvc({
            projectId: meeting.project_id,
            meetingId,
            parentTopId: selectedTop.id,
            level,
            title: editorDraft.title.trim(),
          });
          if (created?.id) setSelectedTopId(created.id);
        }
      }
      await reloadTops();
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
      ampel: 'gelb',
      status: 'offen',
      responsible: '',
      responsibleId: '',
      isImportant: false,
      level: 1,
    });
  };

  const handleDeleteSelectedTop = () => {
    if (!selectedTop) return;
    const run = async () => {
      await deleteTopSvc({ meetingId, topId: selectedTop.id });
      await reloadTops();
      setSelectedTopId(null);
    };
    void run();
  };

  const handleMoveSelectedTop = () => {
    // Movement UI not yet wired. Stub kept intentionally.
  };

  const handleTopSelect = (topId) => {
    setSelectedTopId(topId);
    setEditorMode('edit');

    const top = findMeetingTopNodeById(topTree, topId);
    if (top) {
      setEditorDraft({
        level: top.level,
        title: top.title,
        longtext: top.longtext || '',
        dueDate: top.dueDate || '',
        ampel: top.status === 'erledigt' ? 'grün' : top.isImportant ? 'rot' : 'gelb',
        status: top.status || 'offen',
        responsible: top.responsible || '',
        responsibleId: top.responsibleId || '',
        isImportant: Boolean(top.isImportant),
      });
    }
  };

  const handleEndProtocol = () => {
    const run = async () => {
      const res = await closeMeetingService(meetingId);
      if (!res.ok) {
        if (res.errorCode === 'NUM_GAP') {
          alert('Protokoll kann nicht geschlossen werden: Nummernlücke gefunden.');
        } else if (res.error) {
          alert(res.error);
        } else {
          alert('Schließen fehlgeschlagen.');
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
              responsibleOptions={firms}
              onFieldChange={handleEditorFieldChange}
              onSave={handleSaveEditor}
              onDelete={handleDeleteSelectedTop}
              onCancel={handleCancelEdit}
              onToggleImportant={(checked) => handleEditorFieldChange('isImportant', checked)}
              toolbar={
            <ProtocolBottomToolBar
              tops={tops}
              selectedTop={selectedTop}
              onStartRootCreate={startCreateRootTop}
              onStartChildCreate={startCreateChildTop}
              onStartSubChildCreate={startCreateSubChildTop}
            />
          }
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
