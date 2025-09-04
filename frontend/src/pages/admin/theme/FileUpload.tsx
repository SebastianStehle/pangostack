import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useClients } from 'src/api';
import { Forms, Image } from 'src/components';
import { toastError } from 'src/components/ToastError';
import { useTheme } from 'src/hooks';
import { texts } from 'src/texts';

export interface FileUploadProps {
  // The file property.
  property: 'logo' | 'loginLogo' | 'loginBackground' | 'favicon';

  // The fallback image.
  fallback: string;

  // The title.
  title: string;

  // The hint to describe the file.
  hints?: string;
}

export const FileUpload = (props: FileUploadProps) => {
  const { fallback, hints, property, title } = props;

  const clients = useClients();
  const { refetch, setTheme } = useTheme();
  const [file, setFile] = useState<File | undefined>(undefined);

  const updating = useMutation({
    mutationFn: (request: File) => {
      return clients.settings.postFile(property, request);
    },
    onSuccess: () => {
      toast.success(texts.theme.fileUploadSucceeded);
      refetch();
    },
    onError: async (error) => {
      toastError(texts.theme.fileUploadFailed, error);
    },
  });

  useEffect(() => {
    setTheme({ [property]: file });
  }, [file, property, setTheme]);

  const upload = () => {
    if (file) {
      updating.mutate(file);
    }
  };

  return (
    <>
      <div className="flex flex-row items-center gap-8">
        <div className="relative">
          <Image size="10rem" baseUrl={clients.url} fallback={fallback} file={file} fileId={property} />
        </div>

        <div className="divider divider-horizontal"></div>

        <div className="flex flex-col gap-2">
          <h3 className="text-lg">{title}</h3>

          <div className="flex flex-row gap-2">
            <input
              type="file"
              className="file-input file-input-bordered w-full max-w-xs"
              onChange={(event) => setFile(event.target.files?.[0])}
            />

            <button type="submit" className="btn btn-primary w-auto" disabled={!file} onClick={upload || updating.isPending}>
              {texts.common.save}
            </button>
          </div>

          <Forms.Hints hints={hints} />
        </div>
      </div>
    </>
  );
};
