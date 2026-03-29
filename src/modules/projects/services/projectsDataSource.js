import * as fakeProjectsDataSource from './fakeProjectsDataSource.js';
import * as apiProjectsDataSource from './apiProjectsDataSource.js';

const PROJECTS_DATA_SOURCE = 'fake';

// Zentraler Austauschpunkt für die Projektdatenquelle.
const projectsDataSource =
  PROJECTS_DATA_SOURCE === 'api' ? apiProjectsDataSource : fakeProjectsDataSource;

export function getProjectsDataSource() {
  return projectsDataSource;
}
