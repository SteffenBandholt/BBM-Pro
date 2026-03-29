import * as fakeProjectsDataSource from './fakeProjectsDataSource.js';

// Austauschpunkt für eine spätere echte API-/Backend-Datenquelle.
// Aktuell bleibt das Modul bewusst auf der Fake-Implementierung.
const projectsDataSource = fakeProjectsDataSource;

export function getProjectsDataSource() {
  return projectsDataSource;
}
