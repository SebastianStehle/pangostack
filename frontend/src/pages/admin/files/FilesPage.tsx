import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FileDto, useApi } from 'src/api';
import { buildError } from 'src/lib';
import { texts } from 'src/texts';
import { FileCard } from './FileCard';
import { useFilesStore } from './state';

export function FilesPage() {
  const api = useApi();

  const bucketParam = useParams<'id'>();
  const bucketId = +bucketParam.id!;
  const [uploading, setUploading] = useState<File[]>([]);
  const { files, removeFile, setFile, setFiles } = useFilesStore();

  const { data: loadedFiles } = useQuery({
    queryKey: ['files', bucketId],
    queryFn: () => api.files.getFiles(bucketId),
  });

  useEffect(() => {
    if (loadedFiles) {
      setFiles(loadedFiles.items);
    }
  }, [loadedFiles, setFiles]);

  const upload = useMutation({
    mutationFn: (file: File) => api.files.postFile(bucketId, file),
    onMutate: (file) => {
      setUploading((files) => [...files, file]);
    },
    onSuccess: (file) => {
      setFile(file);
    },
    onSettled: (_, __, file) => {
      setUploading((files) => files.filter((f) => f !== file));
    },
    onError: async (error) => {
      toast.error(await buildError(texts.files.uploadFailed, error));
    },
  });

  const deleting = useMutation({
    mutationFn: (file: FileDto) => {
      return api.files.deleteFile(bucketId, file.id);
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
      <div className="flex flex-col gap-8">
        <div className="flex">
          <h2 className="grow text-2xl">{texts.files.headline}</h2>
        </div>

        <div
          className="flex h-32 items-center justify-center rounded-box border-2 border-dashed border-gray-300 p-4 text-gray-600 transition-all hover:border-gray-400"
          {...getRootProps()}
        >
          <input {...getInputProps()} />
          {isDragActive ? <p>{texts.common.dropZoneDrop}</p> : <p>{texts.common.dropZone}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {files.map((file) => (
            <FileCard key={file.id} file={file} onDelete={deleting.mutate} />
          ))}

          {uploading.map((file, i) => (
            <div
              key={i}
              className="flex h-32 flex-col items-center justify-center gap-2 truncate rounded-box bg-slate-200 p-8 text-sm text-slate-500"
            >
              {texts.files.uploading}

              <div>{file.name}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
