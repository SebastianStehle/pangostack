import { create } from 'zustand';
import { BucketDto, FileDto } from 'src/api';

interface FilesState {
  // The files.
  files: FileDto[];

  // Adds or sets an file.
  setFile: (file: FileDto) => void;

  // Sets all files.
  setFiles: (source: FileDto[]) => void;

  // Remove an file.
  removeFile: (id: number) => void;
}

interface BucketsState {
  // The buckets.
  buckets: BucketDto[];

  // Adds or sets an bucket.
  setBucket: (bucket: BucketDto) => void;

  // Sets all buckets.
  setBuckets: (bucket: BucketDto[]) => void;

  // Remove an bucket.
  removeBucket: (id: number) => void;
}

export const useFilesStore = create<FilesState>()((set) => ({
  specs: [],
  files: [],
  setFile: (file: FileDto) => {
    return set((state) => {
      const files = [...state.files];

      const indexOfExisting = files.findIndex((x) => x.id === file.id);
      if (indexOfExisting >= 0) {
        files[indexOfExisting] = file;
      } else {
        files.push(file);
      }

      return { files };
    });
  },
  setFiles: (files: FileDto[]) => {
    return set({ files });
  },
  removeFile: (id: number) => {
    return set((state) => ({ files: state.files.filter((x) => x.id !== id) }));
  },
}));

export const useBucketstore = create<BucketsState>()((set) => ({
  buckets: [],
  setBucket: (bucket: BucketDto) => {
    return set((state) => {
      const buckets = [...state.buckets];

      const indexOfExisting = state.buckets.findIndex((x) => x.id === bucket.id);
      if (indexOfExisting >= 0) {
        buckets[indexOfExisting] = bucket;
      } else {
        buckets.push(bucket);
      }

      return { buckets };
    });
  },
  setBuckets: (buckets: BucketDto[]) => {
    return set({ buckets });
  },
  removeBucket: (id: number) => {
    return set((state) => ({ buckets: state.buckets.filter((x) => x.id !== id) }));
  },
}));
