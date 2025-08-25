import classNames from 'classnames';
import { useEffect, useState } from 'react';

export interface ImageProps {
  // The base URL for the normal logo.
  baseUrl: string;

  // The class name.
  className?: string;

  // The ID of the file.
  fileId: string;

  // The file to use.
  file?: File | null;

  // The fallback image.
  fallback: string;

  // The version.
  version?: number;

  // The size in rem.
  size: string;
}

export const Image = (props: ImageProps) => {
  const { baseUrl, className, fallback, file, fileId, size, version } = props;

  const [path, setPath] = useState<string>('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);

    if (file) {
      setPath(window.URL.createObjectURL(file));
    } else {
      setPath(`${baseUrl}/api/settings/files/${fileId}?version=${version || 0}`);
    }
  }, [baseUrl, file, fileId, version]);

  const handleError = () => {
    setPath(fallback);
  };

  return (
    <img
      style={{ width: size, height: size }}
      className={classNames(className, { invisible: !loaded })}
      src={path}
      onLoad={() => setLoaded(true)}
      onError={handleError}
    />
  );
};
