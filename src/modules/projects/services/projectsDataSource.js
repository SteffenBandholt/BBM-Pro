import * as fakeProjectsDataSource from './fakeProjectsDataSource.js';
import * as apiProjectsDataSource from './apiProjectsDataSource.js';
import * as localProjectsDataSource from './localProjectsDataSource.js';

const PROJECTS_DATA_SOURCE = 'local';

// Zentraler Austauschpunkt für die Projektdatenquelle.
const projectsDataSource =
  PROJECTS_DATA_SOURCE === 'api'
    ? apiProjectsDataSource
    : PROJECTS_DATA_SOURCE === 'local'
      ? localProjectsDataSource
      : fakeProjectsDataSource;

export function getProjectsDataSource() {
  return projectsDataSource;
}
