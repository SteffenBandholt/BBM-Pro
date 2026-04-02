import MeetingListItem from './MeetingListItem.jsx';

export default function MeetingsList({ meetings, onMeetingClick, onMeetingKeywordSave }) {
  return (
    <div className="project-list">
      {meetings.map((meeting) => (
        <MeetingListItem
          key={meeting.id}
          meeting={meeting}
          onClick={() => onMeetingClick(meeting)}
          onKeywordSave={onMeetingKeywordSave}
        />
      ))}
    </div>
  );
}
