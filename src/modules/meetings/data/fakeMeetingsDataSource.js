let meetingsStore = [
  {
    id: 1,
    projectId: 1,
    title: 'Baubesprechung 1',
    date: '2025-03-01',
    keyword: 'Kickoff',
  },
];

export async function listMeetings(projectId) {
  return meetingsStore.filter((meeting) => meeting.projectId === Number(projectId));
}

export async function createMeeting(projectId, input) {
  const newMeeting = {
    id: Date.now(),
    projectId: Number(projectId),
    title: input.title,
    date: input.date,
    keyword: input.keyword ?? '',
  };

  meetingsStore = [newMeeting, ...meetingsStore];
  return newMeeting;
}
