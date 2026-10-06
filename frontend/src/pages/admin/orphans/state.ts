import { create } from 'zustand';
import { OrphanedResourceDto } from 'src/api';

interface OrphanedResourcesState {
  // The orphaned resources of the current page.
  orphanedResources: OrphanedResourceDto[];

  // Sets all orphaned resources.
  setOrphanedResources: (orphanedResources: OrphanedResourceDto[]) => void;

  // Replaces a single orphaned resource after its status has been changed.
  setOrphanedResource: (orphanedResource: OrphanedResourceDto) => void;
}

export const useOrphanedResourcesStore = create<OrphanedResourcesState>()((set) => ({
  orphanedResources: [],
  setOrphanedResources: (orphanedResources: OrphanedResourceDto[]) => {
    return set({ orphanedResources });
  },
  setOrphanedResource: (orphanedResource: OrphanedResourceDto) => {
    return set((state) => ({
      orphanedResources: state.orphanedResources.map((x) => (x.id === orphanedResource.id ? orphanedResource : x)),
    }));
  },
}));
