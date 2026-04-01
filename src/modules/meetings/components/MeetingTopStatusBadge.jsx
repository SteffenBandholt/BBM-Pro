const STATUS_LABELS = {
  offen: 'Offen',
  'in arbeit': 'In Arbeit',
  blockiert: 'Blockiert',
  verzug: 'Verzug',
  erledigt: 'Erledigt',
  hidden: 'Ausgeblendet',
  trashed: 'Gelöscht',
};

export default function MeetingTopStatusBadge({ status }) {
  const label = STATUS_LABELS[status] ?? status ?? 'Unbekannt';

  return <span className={`meeting-status-badge meeting-status-badge--${status || 'offen'}`}>{label}</span>;
}
