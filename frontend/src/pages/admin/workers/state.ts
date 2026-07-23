import { create } from 'zustand';
import { WorkerWithStatusDto } from 'src/api';

interface WorkersState {
  // The workers.
  workers: WorkerWithStatusDto[];

  // Removes a worker.
  removeWorker: (id: number) => void;

  // Sets all workers.
  setWorkers: (workers: WorkerWithStatusDto[]) => void;
}

export const useWorkersStore = create<WorkersState>()((set) => ({
  workers: [],
  setWorkers: (workers: WorkerWithStatusDto[]) => {
    return set({ workers });
  },
  removeWorker: (id: number) => {
    return set((state) => ({ workers: state.workers.filter((x) => x.id !== id) }));
  },
}));
