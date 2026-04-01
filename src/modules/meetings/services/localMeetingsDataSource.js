import * as meetingService from "../../../services/domain/meetingService.js";

export async function listMeetings(projectId) {
  const rows = await meetingService.listMeetings(projectId);
  return rows.map((m) => ({
    ...m,
    number: m.meeting_index,
    date: m.created_at?.slice(0, 10) || "",
    status: m.is_closed ? "geschlossen" : "offen",
  }));
}

export async function createMeeting(projectId, input) {
  const m = await meetingService.createMeeting({ projectId, title: input?.title || input?.keyword || "" });
  return {
    ...m,
    number: m.meeting_index,
    date: m.created_at?.slice(0, 10) || "",
    status: m.is_closed ? "geschlossen" : "offen",
  };
}
