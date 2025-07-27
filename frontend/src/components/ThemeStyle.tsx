import Color from 'colorjs.io';
import ReactDOM from 'react-dom';
import { useTheme } from 'src/hooks';

export function ThemeStyle() {
  const { theme } = useTheme();

  return ReactDOM.createPortal(
    <>
      <style>
        {colorClass('p', theme.primaryColor)}
        {colorClass('pc', theme.primaryContentColor)}

        {theme.customCss || ''}
      </style>
    </>,
    document.querySelector('#head')!,
  );
}

function colorClass(className: string, color?: string) {
  return color
    ? `:root {
      --${className}: ${convertColor(color)}
    }
    `
    : '';
}

function convertColor(rgb: string) {
  const color = new Color(rgb);

  const coords = color.to('oklch').coords;

  if (Number.isNaN(coords[2])) {
    coords[2] = 0;
  }

  return coords.join(' ');
}
