import Color from 'colorjs.io';
import ReactDOM from 'react-dom';
import { useTheme } from 'src/hooks';
import { isNumber } from 'src/lib';

export const ThemeStyle = () => {
  const { theme } = useTheme();

  return ReactDOM.createPortal(
    <>
      <style>
        {colorClass('color-primary', theme.primaryColor)}
        {colorClass('color-primary-content', theme.primaryContentColor)}
        {colorClass('header', theme.headerColor)}

        {theme.customCss || ''}
      </style>
    </>,
    document.querySelector('#head')!,
  );
};

function colorClass(className: string, color?: string | null) {
  return color
    ? `:root {
      --${className}: oklch(${convertColor(color)})
    }
    `
    : '';
}

function convertColor(rgb: string) {
  const color = new Color(rgb);

  const coords = color.to('oklch').coords;

  if (Number.isNaN(coords[2]) || !isNumber(coords[2])) {
    coords[2] = 0;
  }

  return coords.join(' ');
}
