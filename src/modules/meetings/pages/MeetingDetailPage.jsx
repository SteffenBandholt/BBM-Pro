import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  addMeetingTop,
  buildMeetingTopTree,
  canDeleteMeetingTop,
  createEmptyTopDraft,
  createInitialMeetingTops,
  deleteMeetingTop,
  findMeetingTopNodeById,
  moveMeetingTop,
  updateMeetingTop,
} from '../data/meetingTopModel.js';
import ProtocolActionBar from '../components/ProtocolActionBar.jsx';
import ProtocolBottomToolBar from '../components/ProtocolBottomToolBar.jsx';
import ProtocolEditorPanel from '../components/ProtocolEditorPanel.jsx';
import ProtocolTopList from '../components/ProtocolTopList.jsx';

export default function MeetingDetailPage() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState({
    id: meetingId,
    isClosed: false,
    viewMode: 'Protokoll',
  });
  const [tops, setTops] = useState(() => createInitialMeetingTops());
  const [selectedTopId, setSelectedTopId] = useState(null);
  const [editorMode, setEditorMode] = useState('edit');
  const [editorDraft, setEditorDraft] = useState(() => createEmptyTopDraft());

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

  const startEditTop = (top) => {
    setSelectedTopId(top.id);
    setEditorMode('edit');
    setEditorDraft({
      level: top.level,
      title: top.title,
      longtext: top.longtext || '',
      dueDate: top.dueDate || '',
      ampel: top.status === 'erledigt' ? 'grün' : top.isImportant ? 'rot' : 'gelb',
      status: top.status || 'neu',
      responsible: top.responsible || '',
      isImportant: Boolean(top.isImportant),
    });
  };

  const startCreateRootTop = () => {
    setSelectedTopId(null);
    setEditorMode('create-root');
    setEditorDraft({
      ...createEmptyTopDraft(),
      level: 1,
    });
  };

  const startCreateChildTop = () => {
    if (!selectedTop) return;
    setEditorMode('create-child');
    setEditorDraft({
      ...createEmptyTopDraft(),
      level: selectedTop.level,
      parentTopId: selectedTop.parentTopId ?? null,
    });
  };

  const handleEditorFieldChange = (field, value) => {
    setEditorDraft((currentDraft) => ({ ...currentDraft, [field]: value }));
  };

  const handleSaveEditor = () => {
    if (editorMode === 'edit' && selectedTop) {
      setTops((currentTops) =>
        updateMeetingTop(currentTops, selectedTop.id, {
          ...editorDraft,
          title: editorDraft.title.trim(),
        }),
      );
      return;
    }

    const parentTopId = editorMode === 'create-child' ? selectedTop?.id ?? null : null;
    setTops((currentTops) =>
      addMeetingTop(currentTops, {
        ...editorDraft,
        title: editorDraft.title.trim(),
        parentTopId,
      }),
    );
    setEditorMode('edit');
  };

  const handleCancelEdit = () => {
    if (selectedTop) {
      startEditTop(selectedTop);
      return;
    }

    setEditorMode('edit');
    setEditorDraft(createEmptyTopDraft());
  };

  const handleDeleteSelectedTop = () => {
    if (!selectedTop || !canDeleteMeetingTop(tops, selectedTop.id, meeting.isClosed)) {
      return;
    }

    setTops((currentTops) => deleteMeetingTop(currentTops, selectedTop.id));
    setSelectedTopId(null);
  };

  const handleMoveSelectedTop = () => {
    if (!selectedTop) return;
    setTops((currentTops) => moveMeetingTop(currentTops, selectedTop.id, selectedMoveTarget || null));
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
        status: top.status || 'neu',
        responsible: top.responsible || '',
        isImportant: Boolean(top.isImportant),
      });
    }
  };

  const handleViewToggle = () => {
    setMeeting((current) => ({
      ...current,
      viewMode: current.viewMode === 'Protokoll' ? 'Bearbeitung' : 'Protokoll',
    }));
  };

  const handleEndProtocol = () => {
    setMeeting((current) => ({ ...current, isClosed: true }));
  };

  const handleClose = () => navigate(-1);

  return (
    <section className="page-section protocol-page">
      <div className="protocol-paper">
        <ProtocolActionBar onToggleView={handleViewToggle} onEndProtocol={handleEndProtocol} onClose={handleClose} />

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
