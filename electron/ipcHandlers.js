import {
  projectsRepo,
  meetingsRepo,
  topsRepo,
  meetingTopsRepo,
  globalFirmsRepo,
  globalFirmEmployeesRepo,
  projectFirmsRepo,
  projectPersonsRepo,
  meetingParticipantsRepo,
} from '../src/node-sqlite/repos/index.js';
import { getPrintData } from '../src/services/domain/printService.js';

function wrap(handler) {
  return async (_event, payload) => {
    try {
      return { ok: true, data: await handler(payload) };
    } catch (err) {
      return { ok: false, error: err?.message || String(err) };
    }
  };
}

export function registerDbIpcHandlers(ipcMain) {
  ipcMain.handle('db:projects:list', wrap(() => projectsRepo.listProjects()));
  ipcMain.handle('db:projects:create', wrap((p) => projectsRepo.createProject(p)));
  ipcMain.handle('db:projects:update', wrap((p) => projectsRepo.updateProject(p.projectId, p.patch || {})));

  ipcMain.handle('db:meetings:list', wrap((p) => meetingsRepo.listByProject(p.projectId)));
  ipcMain.handle('db:meetings:create', wrap((p) => meetingsRepo.createMeeting(p)));
  ipcMain.handle('db:meetings:get', wrap((p) => meetingsRepo.getMeetingById(p.meetingId)));
  ipcMain.handle('db:meetings:close', wrap((p) => meetingsRepo.closeMeeting(p.meetingId, p.payload || {})));
  ipcMain.handle('db:meetings:updateTitle', wrap((p) => meetingsRepo.updateMeetingTitle(p)));
  ipcMain.handle('db:meetings:updateLabel', wrap((p) => meetingsRepo.updateMeetingLabel(p)));

  ipcMain.handle('db:tops:create', wrap((p) => topsRepo.createTop(p)));
  ipcMain.handle('db:tops:updateTitle', wrap((p) => topsRepo.updateTitle(p)));
  ipcMain.handle('db:tops:setHidden', wrap((p) => topsRepo.setHidden(p)));
  ipcMain.handle('db:tops:move', wrap((p) => topsRepo.moveTop(p)));
  ipcMain.handle('db:tops:get', wrap((p) => topsRepo.getTopById(p.topId)));
  ipcMain.handle('db:tops:getNextNumber', wrap((p) => topsRepo.getNextNumber(p.projectId, p.parentTopId)));
  ipcMain.handle('db:tops:hasChildren', wrap((p) => topsRepo.hasChildren(p.topId)));
  ipcMain.handle('db:tops:softDelete', wrap((p) => topsRepo.softDeleteTop(p)));

  ipcMain.handle('db:meetingTops:list', wrap((p) => meetingTopsRepo.listJoinedByMeeting(p.meetingId)));
  ipcMain.handle('db:meetingTops:attach', wrap((p) => meetingTopsRepo.attachTopToMeeting(p)));
  ipcMain.handle('db:meetingTops:update', wrap((p) => meetingTopsRepo.updateMeetingTop(p)));
  ipcMain.handle('db:meetingTops:delete', wrap((p) => meetingTopsRepo.deleteByTopId(p.topId)));
  ipcMain.handle('db:meetingTops:carryOver', wrap((p) =>
    meetingTopsRepo.carryOverFromMeeting(p.fromMeetingId, p.toMeetingId, { skipIds: new Set(p.skipIds || []) })));
  ipcMain.handle('db:meetingTops:get', wrap((p) => meetingTopsRepo.getMeetingTop(p.meetingId, p.topId)));

  ipcMain.handle('db:globalFirms:list', wrap(() => globalFirmsRepo.listFirms()));
  ipcMain.handle('db:globalFirms:get', wrap((p) => globalFirmsRepo.getById(p.firmId)));
  ipcMain.handle('db:globalFirms:create', wrap((p) => globalFirmsRepo.createFirm(p)));
  ipcMain.handle('db:globalFirmEmployees:list', wrap((p) => globalFirmEmployeesRepo.listByFirm(p.globalFirmId)));
  ipcMain.handle('db:globalFirmEmployees:create', wrap((p) => globalFirmEmployeesRepo.createEmployee(p)));

  ipcMain.handle('db:firms:list', wrap((p) => projectFirmsRepo.listByProject(p.projectId)));
  ipcMain.handle('db:firms:get', wrap((p) => projectFirmsRepo.getById(p.firmId)));
  ipcMain.handle('db:firms:create', wrap((p) => projectFirmsRepo.createFirm(p)));
  ipcMain.handle('db:firms:remove', wrap((p) => projectFirmsRepo.removeFirm(p.firmId)));

  ipcMain.handle('db:persons:list', wrap((p) => projectPersonsRepo.listByProject(p.projectId)));

  ipcMain.handle('db:participants:list', wrap((p) => meetingParticipantsRepo.listMeetingParticipants(p.meetingId)));
  ipcMain.handle('db:participants:set', wrap((p) => meetingParticipantsRepo.setMeetingParticipant(p)));
  ipcMain.handle('db:participants:seed', wrap((p) => meetingParticipantsRepo.seedFromProject(p.meetingId, p.projectId)));

  ipcMain.handle('db:print:get', wrap((p) =>
    getPrintData(p, {
      projectsRepo,
      meetingsRepo,
      meetingTopsRepo,
      projectFirmsRepo,
      projectPersonsRepo,
      meetingParticipantsRepo,
      topsRepo,
    })));
}
