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
  const [selectedTopId, setSelectedTopId] = useState(null);
  const [editorMode, setEditorMode] = useState('edit');
  const [editorDraft, setEditorDraft] = useState({
    title: '',
    longtext: '',
    dueDate: '',
    ampel: 'gelb',
    status: 'offen',
    responsible: '',
    isImportant: false,
    level: 1,
  });

  useEffect(() => {
    const load = async () => {
      const m = await getMeeting(meetingId);
      if (m) {
        setMeeting({ id: m.id, isClosed: !!m.is_closed, project_id: m.project_id });
      }
      const rows = await listMeetingTops(meetingId);
      setTops(rows.map(mapRowToUi));
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
      isImportant: false,
      level: 1,
    });
  };

  const startCreateChildTop = () => {
    if (!selectedTop) return;
    setEditorMode('create-child');
    setEditorDraft({
      title: '',
      longtext: '',
      dueDate: '',
      ampel: 'gelb',
      status: 'offen',
      responsible: '',
      isImportant: false,
      level: selectedTop.level + 1,
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
            responsible_label: editorDraft.responsible,
            is_important: editorDraft.isImportant,
          },
        });
      } else {
        const parentTopId = editorMode === 'create-child' ? selectedTop?.id ?? null : null;
        if (!meeting.project_id) return;
        await createTopSvc({
          projectId: meeting.project_id,
          meetingId,
          parentTopId,
          level: editorDraft.level || (parentTopId ? (selectedTop?.level || 1) + 1 : 1),
          title: editorDraft.title.trim(),
        });
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
          </div>

          <div className="protocol-bottom-area">
            <ProtocolEditorPanel
              title={topLabel}
              draft={editorDraft}
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
                />
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}
