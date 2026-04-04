const invoke = (channel, payload = {}) => {
  if (typeof window === "undefined" || !window.desktopApi?.invoke) {
    throw new Error("IPC bridge not available");
  }
  return window.desktopApi.invoke(channel, payload).then((res) => {
    if (res?.ok) return res.data;
    throw new Error(res?.error || "IPC call failed");
  });
};

export const projectsRepo = {
  listProjects: () => invoke("db:projects:list"),
  createProject: (p) => invoke("db:projects:create", p),
  updateProject: (projectId, patch) => invoke("db:projects:update", { projectId, patch }),
  getProjectById: (id) => invoke("db:projects:list").then((list) => list.find((p) => String(p.id) === String(id)) || null),
};

export const meetingsRepo = {
  listByProject: (projectId) => invoke("db:meetings:list", { projectId }),
  getMeetingById: (meetingId) => invoke("db:meetings:get", { meetingId }),
  getOpenMeetingByProject: async (projectId) => {
    const rows = await invoke("db:meetings:list", { projectId });
    return rows.find((m) => !m.is_closed) || null;
  },
  getLastClosedMeetingByProject: async (projectId) => {
    const rows = await invoke("db:meetings:list", { projectId });
    return rows.filter((m) => m.is_closed).sort((a, b) => b.meeting_index - a.meeting_index)[0] || null;
  },
  createMeeting: (p) => invoke("db:meetings:create", p),
  closeMeeting: (meetingId, payload) => invoke("db:meetings:close", { meetingId, payload }),
  updateMeetingTitle: ({ meetingId, title }) => invoke("db:meetings:updateTitle", { meetingId, title }),
  updateMeetingLabel: ({ meetingId, protocolLabel }) => invoke("db:meetings:updateLabel", { meetingId, protocolLabel }),
};

export const topsRepo = {
  getTopById: (topId) => invoke("db:tops:get", { topId }),
  hasChildren: (topId) => invoke("db:tops:hasChildren", { topId }),
  getNextNumber: (projectId, parentTopId) => invoke("db:tops:getNextNumber", { projectId, parentTopId }),
  createTop: (p) => invoke("db:tops:create", p),
  updateTitle: (p) => invoke("db:tops:updateTitle", p),
  setHidden: (p) => invoke("db:tops:setHidden", p),
  moveTop: (p) => invoke("db:tops:move", p),
  softDeleteTop: (p) => invoke("db:tops:softDelete", p), // handler not yet implemented; keep symmetrical
};

export const meetingTopsRepo = {
  getMeetingTop: (meetingId, topId) => invoke("db:meetingTops:get", { meetingId, topId }),
  attachTopToMeeting: (p) => invoke("db:meetingTops:attach", p),
  updateMeetingTop: (p) => invoke("db:meetingTops:update", p),
  listJoinedByMeeting: (meetingId) => invoke("db:meetingTops:list", { meetingId }),
  listLatestByProject: async (projectId) => {
    const meetings = await invoke("db:meetings:list", { projectId });
    const latest = meetings.sort((a, b) => b.meeting_index - a.meeting_index)[0];
    if (!latest) return [];
    return invoke("db:meetingTops:list", { meetingId: latest.id });
  },
  carryOverFromMeeting: (fromMeetingId, toMeetingId, { skipIds } = {}) =>
    invoke("db:meetingTops:carryOver", { fromMeetingId, toMeetingId, skipIds: Array.from(skipIds || []) }),
  deleteByTopId: (topId) => invoke("db:meetingTops:delete", { topId }),
};

export const projectFirmsRepo = {
  listByProject: (projectId) => invoke("db:firms:list", { projectId }),
  getById: (firmId) => invoke("db:firms:get", { firmId }),
  createFirm: (p) => invoke("db:firms:create", p),
  removeFirm: (firmId) => invoke("db:firms:remove", { firmId }),
};

export const globalFirmsRepo = {
  listFirms: () => invoke("db:globalFirms:list"),
  getById: (firmId) => invoke("db:globalFirms:get", { firmId }),
  createFirm: (p) => invoke("db:globalFirms:create", p),
};

export const globalFirmEmployeesRepo = {
  listByFirm: (globalFirmId) => invoke("db:globalFirmEmployees:list", { globalFirmId }),
  getById: (employeeId) => invoke("db:globalFirmEmployees:get", { employeeId }),
  createEmployee: (p) => invoke("db:globalFirmEmployees:create", p),
};

export const projectPersonsRepo = {
  listByProject: (projectId) => invoke("db:persons:list", { projectId }),
};

export const projectFirmEmployeesRepo = {
  listByProjectFirm: (projectFirmId) => invoke("db:projectFirmEmployees:list", { projectFirmId }),
  activateEmployee: (p) => invoke("db:projectFirmEmployees:activate", p),
  deactivateEmployee: (p) => invoke("db:projectFirmEmployees:deactivate", p),
};

export const projectLocalFirmEmployeesRepo = {
  listByProjectFirm: (projectFirmId) => invoke("db:projectLocalFirmEmployees:list", { projectFirmId }),
  getById: (employeeId) => invoke("db:projectLocalFirmEmployees:get", { employeeId }),
  createEmployee: (p) => invoke("db:projectLocalFirmEmployees:create", p),
  updateEmployee: (p) => invoke("db:projectLocalFirmEmployees:update", p),
};

export const meetingParticipantsRepo = {
  listMeetingParticipants: (meetingId) => invoke("db:participants:list", { meetingId }),
  setMeetingParticipant: (p) => invoke("db:participants:set", p),
  removeMeetingParticipant: (p) => invoke("db:participants:remove", p),
  replaceMeetingParticipants: (meetingId, participants) => invoke("db:participants:replace", { meetingId, participants }),
};
