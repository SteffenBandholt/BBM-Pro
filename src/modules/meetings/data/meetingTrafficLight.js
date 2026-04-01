function getDaysUntil(dateValue) {
  if (!dateValue) return null;

  const dueDate = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(dueDate.getTime())) {
    return null;
  }

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((dueDate.getTime() - startOfToday.getTime()) / msPerDay);
}

export function normalizeMeetingStatusToFachStatus(status) {
  switch (status) {
    case 'neu':
    case 'übernommen':
    case 'geändert':
      return 'offen';
    case 'erledigt':
      return 'erledigt';
    case 'blockiert':
    case 'verzug':
    case 'offen':
    case 'in arbeit':
      return status;
    default:
      return null;
  }
}

export function getTrafficLightTone(top) {
  if (!top || top.level === 1) {
    return null;
  }

  const fachStatus = normalizeMeetingStatusToFachStatus(top.status);

  if (!fachStatus) {
    return null;
  }

  if (fachStatus === 'blockiert') {
    return 'blue';
  }

  if (fachStatus === 'verzug') {
    return 'red';
  }

  if (fachStatus === 'erledigt') {
    return 'green';
  }

  if (fachStatus === 'offen' || fachStatus === 'in arbeit') {
    const daysUntil = getDaysUntil(top.dueDate);

    if (daysUntil == null) {
      return null;
    }

    if (daysUntil <= 0) {
      return 'red';
    }

    if (daysUntil <= 10) {
      return 'yellow';
    }

    return 'green';
  }

  return null;
}
