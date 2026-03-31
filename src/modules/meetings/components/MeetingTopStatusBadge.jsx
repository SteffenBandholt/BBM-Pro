const STATUS_LABELS = {
  neu: 'Neu',
  übernommen: 'Übernommen',
  geändert: 'Geändert',
  erledigt: 'Erledigt',
  hidden: 'Ausgeblendet',
  trashed: 'Gelöscht',
};

export default function MeetingTopStatusBadge({ status }) {
  const label = STATUS_LABELS[status] ?? status ?? 'Unbekannt';

  return <span className={`meeting-status-badge meeting-status-badge--${status || 'neu'}`}>{label}</span>;
}
