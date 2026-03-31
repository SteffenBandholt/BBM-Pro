export default function MeetingWorkspaceLayout({ sidebar, header, filters, list, quickCreate }) {
  return (
    <div className="meeting-workspace">
      <div className="meeting-workspace__sidebar">{sidebar}</div>
      <div className="meeting-workspace__main">
        {header}
        {filters}
        {list}
      </div>
      <div className="meeting-workspace__quick-create">{quickCreate}</div>
    </div>
  );
}
