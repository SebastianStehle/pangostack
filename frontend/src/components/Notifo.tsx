import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export interface NotifoProps {
  // The notifo token.
  token: string;

  // The full url to the server.
  url: string;
}

export const Notifo = (props: NotifoProps) => {
  const { token, url } = props;
  const navigate = useNavigate();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `${url}/notifo-sdk.js`;
    script.async = true;

    document.body.appendChild(script);
  }, [url]);

  useEffect(() => {
    const notifo = (window as any)['notifo'] || ((window as any)['notifo'] = []);

    notifo.push([
      'init',
      {
        userToken: token,
        userId: null,
        apiUrl: url,
        onLink: (event: Event, notification: { linkUrl: string }) => {
          try {
            const linkUrl = new URL(notification.linkUrl);

            const currentHost = window.location.hostname;
            if (currentHost === linkUrl.hostname) {
              event.preventDefault();

              navigate(`${linkUrl.pathname}${linkUrl.search}${linkUrl.hash}`);
            }
          } catch (error) {
            console.error('Error parsing notification link URL:', error);
          }
        },
      },
    ]);

    notifo.push(['subscribe']);

    notifo.push([
      'show-notifications',
      'notifo-button',
      {
        position: 'bottom-right',

        // The profile is manage dby the normal settings
        hideProfile: true,
      },
    ]);
  }, [navigate, token, url]);

  return <div id="notifo-button"></div>;
};
