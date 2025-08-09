export interface IconProps {
  icon: IconType;

  // The optional class name.
  className?: string;

  // The size. Defaults to 24px.
  size?: number;
}

export type IconType =
  | 'alert'
  | 'alert-circle'
  | 'arrow-left'
  | 'arrow-up'
  | 'bird'
  | 'clipboard'
  | 'close'
  | 'droplet'
  | 'edit'
  | 'external-link'
  | 'info'
  | 'more-horizontal'
  | 'more-vertical'
  | 'no-document'
  | 'no-connection'
  | 'pie-chart'
  | 'plus'
  | 'refresh'
  | 'search'
  | 'server'
  | 'terminal'
  | 'thumb-down'
  | 'thumb-up'
  | 'trash'
  | 'user'
  | 'users';

export function Icon(props: IconProps) {
  const { className, icon, size } = props;

  const actualSize = size || 24;

  switch (icon) {
    case 'alert':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          width={actualSize}
          height={actualSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      );
    case 'alert-circle':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          width={actualSize}
          height={actualSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      );
    case 'arrow-left':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          width={actualSize}
          height={actualSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      );
    case 'arrow-up':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          width={actualSize}
          height={actualSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="19" x2="12" y2="5"></line>
          <polyline points="5 12 12 5 19 12"></polyline>
        </svg>
      );
    case 'bird':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          width={actualSize}
          height={actualSize}
          viewBox="0 0 388.59 270.164"
        >
          <path d="M182.422 0c-6.008 0-10.879 8.119-10.879 18.133 0 4.082.818 7.835 2.184 10.865a123.297 123.297 0 0 0-87.405 117.871 123.297 123.297 0 0 0 .196 2.725l-61.067-9.906c-3.422-.556-6.908-1.11-10.342-.627-3.433.483-6.87 2.172-8.62 5.166a8.651 8.651 0 0 0 5.884 12.808c-2.659.037-5.296.344-7.629 1.559-3.29 1.713-5.62 5.876-4.015 9.22a8.277 8.277 0 0 0 1.92 2.428 17.606 17.606 0 0 0 18.521 3.143c-2.5 3.586-7.462 4.117-11.754 4.947-4.292.83-9.252 3.258-9.412 7.627-.18 4.909 5.661 7.518 10.47 8.518a137.417 137.417 0 0 0 76.823-6.262 30.98 30.98 0 0 0 5.512-2.61 123.297 123.297 0 0 0 116.81 84.56 123.297 123.297 0 0 0 110.424-68.907l13.705 26.076c1.613 3.07 3.263 6.189 5.713 8.643 2.45 2.453 5.866 4.185 9.31 3.785a8.6 8.6 0 0 0 6.78-12.3 16.643 16.643 0 0 0 5.752 5.06c3.346 1.6 8.074.961 9.783-2.33a8.275 8.275 0 0 0 .787-2.995 17.606 17.606 0 0 0-8.62-16.693c4.368-.157 7.776 3.49 11.019 6.422 3.243 2.931 8.164 5.437 11.752 2.94 4.03-2.808 2.607-9.045.515-13.489a137.419 137.419 0 0 0-51.174-57.637 30.975 30.975 0 0 0-2.48-1.433 123.297 123.297 0 0 0 .031-.438A123.297 123.297 0 0 0 221.033 24.117c-1.83-5.717-5.441-9.611-9.601-9.611-3.383 0-6.368 2.627-8.364 6.664-1.758-6.07-5.452-10.291-9.767-10.291a6.563 6.563 0 0 0-.871.146C190.77 4.545 186.916 0 182.422 0Zm-31.379 85.96a41.087 41.087 0 0 1 28.094 70.806 36.967 36.967 0 0 0-56.742 0c-.46-.44-.91-.888-1.348-1.348a41.087 41.087 0 0 1 21.92-68.711 41.087 41.087 0 0 1 8.076-.746zm110.936 0a41.087 41.087 0 0 1 28.093 70.806 36.967 36.967 0 0 0-56.742 0c-.46-.44-.909-.888-1.347-1.348a41.087 41.087 0 0 1 21.92-68.711 41.087 41.087 0 0 1 8.076-.746zm-55.143 59.831 18.248 53.94-45.625 33.708z" />
          <circle cx="136.75" cy="113.055" r="14.134" />
          <circle cx="247.682" cy="113.055" r="14.134" />
        </svg>
      );
    case 'clipboard':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          width={actualSize}
          height={actualSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
        </svg>
      );
    case 'close':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          width={actualSize}
          height={actualSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      );
    case 'droplet':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          width={actualSize}
          height={actualSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
        </svg>
      );
    case 'edit':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          width={actualSize}
          height={actualSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      );
    case 'external-link':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          width={actualSize}
          height={actualSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
      );
    case 'info':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      );
    case 'more-horizontal':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          width={actualSize}
          height={actualSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="1"></circle>
          <circle cx="19" cy="12" r="1"></circle>
          <circle cx="5" cy="12" r="1"></circle>
        </svg>
      );
    case 'more-vertical':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          width={actualSize}
          height={actualSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="1"></circle>
          <circle cx="12" cy="5" r="1"></circle>
          <circle cx="12" cy="19" r="1"></circle>
        </svg>
      );
    case 'pie-chart':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          width={actualSize}
          height={actualSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
          <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
        </svg>
      );
    case 'plus':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          width={actualSize}
          height={actualSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      );
    case 'refresh':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          width={actualSize}
          height={actualSize}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="1 4 1 10 7 10"></polyline>
          <polyline points="23 20 23 14 17 14"></polyline>
          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
        </svg>
      );
    case 'search':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          width={actualSize}
          height={actualSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      );
    case 'server':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          width={actualSize}
          height={actualSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
          <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
          <line x1="6" y1="6" x2="6.01" y2="6"></line>
          <line x1="6" y1="18" x2="6.01" y2="18"></line>
        </svg>
      );
    case 'terminal':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          width={actualSize}
          height={actualSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="4 17 10 11 4 5"></polyline>
          <line x1="12" y1="19" x2="20" y2="19"></line>
        </svg>
      );
    case 'thumb-down':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          width={actualSize}
          height={actualSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
        </svg>
      );
    case 'thumb-up':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          width={actualSize}
          height={actualSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
        </svg>
      );
    case 'trash':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          width={actualSize}
          height={actualSize}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      );
    case 'user':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          width={actualSize}
          height={actualSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      );
    case 'users':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          width={actualSize}
          height={actualSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      );

    case 'no-document':
      return (
        <svg width={actualSize} viewBox="0 0 250 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="250" height="200" fill="white" />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M63 134H154C154.515 134 155.017 133.944 155.5 133.839C155.983 133.944 156.485 134 157 134H209C212.866 134 216 130.866 216 127C216 123.134 212.866 120 209 120H203C199.134 120 196 116.866 196 113C196 109.134 199.134 106 203 106H222C225.866 106 229 102.866 229 99C229 95.134 225.866 92 222 92H200C203.866 92 207 88.866 207 85C207 81.134 203.866 78 200 78H136C139.866 78 143 74.866 143 71C143 67.134 139.866 64 136 64H79C75.134 64 72 67.134 72 71C72 74.866 75.134 78 79 78H39C35.134 78 32 81.134 32 85C32 88.866 35.134 92 39 92H64C67.866 92 71 95.134 71 99C71 102.866 67.866 106 64 106H24C20.134 106 17 109.134 17 113C17 116.866 20.134 120 24 120H63C59.134 120 56 123.134 56 127C56 130.866 59.134 134 63 134ZM226 134C229.866 134 233 130.866 233 127C233 123.134 229.866 120 226 120C222.134 120 219 123.134 219 127C219 130.866 222.134 134 226 134Z"
            fill="#F3F7FF"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M92 140C79.8497 140 70 130.374 70 118.5C70 106.626 79.8497 97 92 97C92.5167 97 93.0292 97.0174 93.537 97.0517C93.1842 95.0878 93 93.0654 93 91C93 72.2223 108.222 57 127 57C141.991 57 154.716 66.702 159.239 80.1695C160.31 80.0575 161.398 80 162.5 80C179.345 80 193 93.4315 193 110C193 125.741 180.675 138.727 165 139.978V140H108.508M103.996 140H97.0314H103.996Z"
            fill="white"
          />
          <path
            d="M92 141.25C92.6904 141.25 93.25 140.69 93.25 140C93.25 139.31 92.6904 138.75 92 138.75V141.25ZM93.537 97.0517L93.4529 98.2988L95.0504 98.4066L94.7673 96.8306L93.537 97.0517ZM159.239 80.1695L158.054 80.5674L158.372 81.5169L159.369 81.4127L159.239 80.1695ZM165 139.978L164.901 138.732L163.75 138.824V139.978H165ZM165 140V141.25H166.25V140H165ZM108.508 138.75C107.817 138.75 107.258 139.31 107.258 140C107.258 140.69 107.817 141.25 108.508 141.25V138.75ZM92 138.75C80.5128 138.75 71.25 129.657 71.25 118.5H68.75C68.75 131.091 79.1866 141.25 92 141.25V138.75ZM71.25 118.5C71.25 107.343 80.5128 98.25 92 98.25V95.75C79.1866 95.75 68.75 105.909 68.75 118.5H71.25ZM92 98.25C92.4886 98.25 92.9731 98.2665 93.4529 98.2988L93.6211 95.8045C93.0853 95.7684 92.5448 95.75 92 95.75V98.25ZM94.7673 96.8306C94.4275 94.9394 94.25 92.991 94.25 91H91.75C91.75 93.1399 91.9408 95.2362 92.3067 97.2727L94.7673 96.8306ZM94.25 91C94.25 72.9127 108.913 58.25 127 58.25V55.75C107.532 55.75 91.75 71.532 91.75 91H94.25ZM127 58.25C141.438 58.25 153.697 67.5936 158.054 80.5674L160.424 79.7716C155.735 65.8104 142.544 55.75 127 55.75V58.25ZM159.369 81.4127C160.397 81.3052 161.442 81.25 162.5 81.25V78.75C161.355 78.75 160.223 78.8097 159.109 78.9263L159.369 81.4127ZM162.5 81.25C178.674 81.25 191.75 94.1412 191.75 110H194.25C194.25 92.7217 180.015 78.75 162.5 78.75V81.25ZM191.75 110C191.75 125.07 179.945 137.532 164.901 138.732L165.099 141.224C181.406 139.923 194.25 126.411 194.25 110H191.75ZM163.75 139.978V140H166.25V139.978H163.75ZM165 138.75H108.508V141.25H165V138.75ZM103.996 138.75H97.0314V141.25H103.996V138.75ZM97.0314 141.25H103.996V138.75H97.0314V141.25Z"
            fill="#1F64E7"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M116.612 64.3426C116.612 96.5657 145.633 123.118 183 126.703C178.317 132.461 171.086 136.367 162.847 136.981V137H95.7431C87.6013 137 74 133.57 74 118.548C74 103.527 84.5742 100.097 95.7431 100.097C96.218 100.097 96.6891 100.112 97.1559 100.141C96.8316 98.4556 96.7746 96.7184 96.6623 94.9474C95.9038 82.9842 101.123 67.907 116.63 63C116.618 63.4473 116.612 63.8944 116.612 64.3426Z"
            fill="#E8F0FE"
          />
          <path
            d="M137 69C143.509 70.7226 148.648 75.8129 150.44 82.2932"
            stroke="#75A4FE"
            stroke-width="2.5"
            stroke-linecap="round"
          />
          <path
            d="M108 101.5C108 105.09 111.134 108 115 108C118.866 108 122 105.09 122 101.5"
            stroke="#1F64E7"
            stroke-width="2.5"
            stroke-linecap="round"
          />
          <path
            d="M137 101.5C137 105.09 140.134 108 144 108C147.866 108 151 105.09 151 101.5"
            stroke="#1F64E7"
            stroke-width="2.5"
            stroke-linecap="round"
          />
          <path d="M122 120H136.5" stroke="#1F64E7" stroke-width="2.5" stroke-linecap="round" />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M69.1561 60.292H57.2101V62.668H65.6581L56.5061 73.756V76H69.3761V73.624H60.0041L69.1561 62.382V60.292ZM82.5681 75.576H73.8801V77.304H80.0241L73.3681 85.368V87H82.7281V85.272H75.9121L82.5681 77.096V75.576Z"
            fill="#75A4FE"
          />
        </svg>
      );

    case 'no-connection':
      return (
        <svg width={actualSize} viewBox="0 0 250 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="250" height="200" fill="white" />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M63 134H154C154.515 134 155.017 133.944 155.5 133.839C155.983 133.944 156.485 134 157 134H209C212.866 134 216 130.866 216 127C216 123.134 212.866 120 209 120H203C199.134 120 196 116.866 196 113C196 109.134 199.134 106 203 106H222C225.866 106 229 102.866 229 99C229 95.134 225.866 92 222 92H200C203.866 92 207 88.866 207 85C207 81.134 203.866 78 200 78H136C139.866 78 143 74.866 143 71C143 67.134 139.866 64 136 64H79C75.134 64 72 67.134 72 71C72 74.866 75.134 78 79 78H39C35.134 78 32 81.134 32 85C32 88.866 35.134 92 39 92H64C67.866 92 71 95.134 71 99C71 102.866 67.866 106 64 106H24C20.134 106 17 109.134 17 113C17 116.866 20.134 120 24 120H63C59.134 120 56 123.134 56 127C56 130.866 59.134 134 63 134ZM226 134C229.866 134 233 130.866 233 127C233 123.134 229.866 120 226 120C222.134 120 219 123.134 219 127C219 130.866 222.134 134 226 134Z"
            fill="#F3F7FF"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M92 140C79.8497 140 70 130.374 70 118.5C70 106.626 79.8497 97 92 97C92.5167 97 93.0292 97.0174 93.537 97.0517C93.1842 95.0878 93 93.0654 93 91C93 72.2223 108.222 57 127 57C141.991 57 154.716 66.702 159.239 80.1695C160.31 80.0575 161.398 80 162.5 80C179.345 80 193 93.4315 193 110C193 125.741 180.675 138.727 165 139.978V140H108.508M103.996 140H97.0314H103.996Z"
            fill="white"
          />
          <path
            d="M92 141.25C92.6904 141.25 93.25 140.69 93.25 140C93.25 139.31 92.6904 138.75 92 138.75V141.25ZM93.537 97.0517L93.4529 98.2988L95.0504 98.4066L94.7673 96.8306L93.537 97.0517ZM159.239 80.1695L158.054 80.5674L158.372 81.5169L159.369 81.4127L159.239 80.1695ZM165 139.978L164.901 138.732L163.75 138.824V139.978H165ZM165 140V141.25H166.25V140H165ZM108.508 138.75C107.817 138.75 107.258 139.31 107.258 140C107.258 140.69 107.817 141.25 108.508 141.25V138.75ZM92 138.75C80.5128 138.75 71.25 129.657 71.25 118.5H68.75C68.75 131.091 79.1866 141.25 92 141.25V138.75ZM71.25 118.5C71.25 107.343 80.5128 98.25 92 98.25V95.75C79.1866 95.75 68.75 105.909 68.75 118.5H71.25ZM92 98.25C92.4886 98.25 92.9731 98.2665 93.4529 98.2988L93.6211 95.8045C93.0853 95.7684 92.5448 95.75 92 95.75V98.25ZM94.7673 96.8306C94.4275 94.9394 94.25 92.991 94.25 91H91.75C91.75 93.1399 91.9408 95.2362 92.3067 97.2727L94.7673 96.8306ZM94.25 91C94.25 72.9127 108.913 58.25 127 58.25V55.75C107.532 55.75 91.75 71.532 91.75 91H94.25ZM127 58.25C141.438 58.25 153.697 67.5936 158.054 80.5674L160.424 79.7716C155.735 65.8104 142.544 55.75 127 55.75V58.25ZM159.369 81.4127C160.397 81.3052 161.442 81.25 162.5 81.25V78.75C161.355 78.75 160.223 78.8097 159.109 78.9263L159.369 81.4127ZM162.5 81.25C178.674 81.25 191.75 94.1412 191.75 110H194.25C194.25 92.7217 180.015 78.75 162.5 78.75V81.25ZM191.75 110C191.75 125.07 179.945 137.532 164.901 138.732L165.099 141.224C181.406 139.923 194.25 126.411 194.25 110H191.75ZM163.75 139.978V140H166.25V139.978H163.75ZM165 138.75H108.508V141.25H165V138.75ZM103.996 138.75H97.0314V141.25H103.996V138.75ZM97.0314 141.25H103.996V138.75H97.0314V141.25Z"
            fill="#1F64E7"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M116.612 64.3426C116.612 96.5657 145.633 123.118 183 126.703C178.317 132.461 171.086 136.367 162.847 136.981V137H95.7431C87.6013 137 74 133.57 74 118.548C74 103.527 84.5742 100.097 95.7431 100.097C96.218 100.097 96.6891 100.112 97.1559 100.141C96.8316 98.4556 96.7746 96.7184 96.6623 94.9474C95.9038 82.9842 101.123 67.907 116.63 63C116.618 63.4473 116.612 63.8944 116.612 64.3426Z"
            fill="#E8F0FE"
          />
          <path
            d="M137 69C143.509 70.7226 148.648 75.8129 150.44 82.2932"
            stroke="#75A4FE"
            stroke-width="2.5"
            stroke-linecap="round"
          />
          <path
            d="M108 101.5C108 105.09 111.134 108 115 108C118.866 108 122 105.09 122 101.5"
            stroke="#1F64E7"
            stroke-width="2.5"
            stroke-linecap="round"
          />
          <path
            d="M137 101.5C137 105.09 140.134 108 144 108C147.866 108 151 105.09 151 101.5"
            stroke="#1F64E7"
            stroke-width="2.5"
            stroke-linecap="round"
          />
          <path d="M122 120H136.5" stroke="#1F64E7" stroke-width="2.5" stroke-linecap="round" />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M69.1561 60.292H57.2101V62.668H65.6581L56.5061 73.756V76H69.3761V73.624H60.0041L69.1561 62.382V60.292ZM82.5681 75.576H73.8801V77.304H80.0241L73.3681 85.368V87H82.7281V85.272H75.9121L82.5681 77.096V75.576Z"
            fill="#75A4FE"
          />
        </svg>
      );
  }
}
