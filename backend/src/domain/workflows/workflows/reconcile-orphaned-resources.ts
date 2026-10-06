import { log, proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

const { getOrphanScanGroups, scanOrphanGroup } = proxyActivities<typeof activities>({
  startToCloseTimeout: '10m',
  retry: {
    maximumAttempts: 3,
  },
});

export async function reconcileOrphanedResources(): Promise<void> {
  const groups = await getOrphanScanGroups({});

  let scanned = 0;
  let found = 0;

  for (const { resourceDefinitionId, serviceVersionId } of groups) {
    try {
      // Each group is one cloud account. A group that cannot be enumerated is skipped instead of
      // failing the run, because its findings would be based on a partial view of that account.
      const result = await scanOrphanGroup({
        resourceDefinitionId,
        runStartedAt: new Date().toISOString(),
        serviceVersionId,
      });

      if (result.scanned) {
        scanned++;
        found += result.found;
      }
    } catch (ex) {
      log.error(`Failed to scan resource ${resourceDefinitionId} of service version ${serviceVersionId}.`, { cause: ex });
    }
  }

  log.info(`Reconciled ${scanned} of ${groups.length} scan groups, ${found} orphaned resources are open.`);
}
