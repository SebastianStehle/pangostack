import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { FileDto, useApi } from 'src/api';
import { buildError } from 'src/lib';
import { texts } from 'src/texts';
import { useUserFilesStore } from '../state';
import { FileCard } from './FileCard';

export function Files() {
  const api = useApi();

  const [uploading, setUploading] = useState<File[]>([]);
  const { files, removeFile, setFile, setFiles } = useUserFilesStore();

  const { data: loadedFiles } = useQuery({
    queryKey: ['user-files'],
    queryFn: () => api.files.getUserFiles(),
  });

  useEffect(() => {
    if (loadedFiles) {
      setFiles(loadedFiles.items);
    }
  }, [loadedFiles, setFiles]);

  const upload = useMutation({
    mutationFn: (file: File) => api.files.postUserFile(file),
    onMutate: (file) => {
      setUploading((files) => [...files, file]);
    },
    onSuccess: (file) => {
      setFile(file);
    },
    onError: async (error) => {
      toast.error(await buildError(texts.files.uploadFailed, error));
    },
    onSettled: (_, __, file) => {
      setUploading((files) => files.filter((f) => f !== file));
    },
  });

  const deleting = useMutation({
    mutationFn: (file: FileDto) => {
      return api.files.deleteUserFile(file.id);
    },
    onSuccess: (_, bucket) => {
      removeFile(bucket.id);
    },
    onError: async (error) => {
      toast.error(await buildError(texts.files.removeFileFailed, error));
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: (files) => upload.mutate(files[0]) });

  return (
    <>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex">
          <h2 className="grow text-xl">{texts.files.headline}</h2>
        </div>

        <div
          className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-4 text-center text-sm text-gray-600 transition-all hover:border-gray-400"
          {...getRootProps()}
        >
          <input {...getInputProps()} />
          {isDragActive ? <p>{texts.common.dropZoneDrop}</p> : <p>{texts.common.dropZone}</p>}
        </div>

        <div className="grid grid-cols-1 gap-2">
          {uploading.map((file, i) => (
            <div
              key={i}
              className="flex h-20 flex-col items-center justify-center gap-2 rounded-box bg-slate-200 text-sm text-slate-500"
            >
              {texts.files.uploading}

              <div>{file.name}</div>
            </div>
          ))}

          {files.map((file) => (
            <FileCard key={file.id} file={file} onDelete={deleting.mutate} />
          ))}
        </div>
      </div>
    </>
  );
}
