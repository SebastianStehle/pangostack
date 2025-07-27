import classNames from 'classnames';
import { useEffect, useState } from 'react';

export interface LogoProps {
  // The base URL for the normal logo.
  baseUrl: string;

  // The file to use.
  file?: File | null;

  // The size in rem.
  size: string;
}

export function Logo(props: LogoProps) {
  const { baseUrl, file, size } = props;

  const [path, setPath] = useState<string>('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);

    if (file) {
      setPath(window.URL.createObjectURL(file));
    } else {
      setPath(`${baseUrl}/settings/logo`);
    }
  }, [baseUrl, file]);

  const handleError = () => {
    setPath('/logo-square.svg');
  };

  return (
    <img
      style={{ width: size, height: size }}
      className={classNames('object-cover', { invisible: !loaded })}
      src={path}
      onLoad={() => setLoaded(true)}
      onError={handleError}
    />
  );
}
