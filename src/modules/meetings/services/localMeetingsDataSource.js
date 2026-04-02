import * as meetingService from "../../../services/domain/meetingService.js";

export async function listMeetings(projectId) {
  const rows = await meetingService.listMeetings(projectId);
  return rows.map((m) => ({
    ...m,
    number: m.meeting_index,
    date: m.created_at?.slice(0, 10) || "",
    protocolLabel: m.protocol_label || "Protokoll",
    keyword: m.title || "",
    status: m.is_closed ? "geschlossen" : "offen",
  }));
}

export async function createMeeting(projectId, input) {
  const m = await meetingService.createMeeting({
    projectId,
    title: input?.keyword || input?.title || "",
    date: input?.date || "",
    protocolLabel: input?.protocolLabel || "Protokoll",
  });
  return {
    ...m,
    number: m.meeting_index,
    date: m.created_at?.slice(0, 10) || "",
    protocolLabel: m.protocol_label || "Protokoll",
    keyword: m.title || "",
    status: m.is_closed ? "geschlossen" : "offen",
  };
}

export async function updateMeetingKeyword(meetingId, keyword) {
  const m = await meetingService.updateMeetingTitle({ meetingId, title: keyword || "" });
  return {
    ...m,
    number: m.meeting_index,
    date: m.created_at?.slice(0, 10) || "",
    protocolLabel: m.protocol_label || "Protokoll",
    keyword: m.title || "",
    status: m.is_closed ? "geschlossen" : "offen",
  };
}

export async function updateMeetingLabel(meetingId, protocolLabel) {
  const m = await meetingService.updateMeetingLabel({ meetingId, protocolLabel: protocolLabel || "Protokoll" });
  return {
    ...m,
    number: m.meeting_index,
    date: m.created_at?.slice(0, 10) || "",
    protocolLabel: m.protocol_label || "Protokoll",
    keyword: m.title || "",
    status: m.is_closed ? "geschlossen" : "offen",
  };
}
