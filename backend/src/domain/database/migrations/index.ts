export * from './migrator.service';
import { Init1760346162798 } from './1760346162798-Init';
import { AddDefinitionSource1760346848861 } from './1760346848861-AddDefinitionSource';
import { AddMetrics1782982415002 } from './1782982415002-AddMetrics';
import { AddDeploymentUpdateSteps1783161589845 } from './1783161589845-AddDeploymentUpdateSteps';
import { AddTeamActivities1784123028202 } from './1784123028202-AddTeamActivities';

export const ALL_MIGRATIONS = [
  Init1760346162798,
  AddDefinitionSource1760346848861,
  AddMetrics1782982415002,
  AddDeploymentUpdateSteps1783161589845,
  AddTeamActivities1784123028202,
];
