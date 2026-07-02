// A global color palette that is shared by all charts.
export const CHART_COLORS = [
  '#4E79A7',
  '#F28E2B',
  '#E15759',
  '#76B7B2',
  '#59A14F',
  '#EDC948',
  '#B07AA1',
  '#FF9DA7',
  '#9C755F',
  '#BAB0AC',
  '#A0CBE8',
  '#FFBE7D',
  '#FF9D9A',
  '#86BCB6',
  '#8CD17D',
  '#F1CE63',
  '#D4A6C8',
  '#FABFD2',
  '#D7B5A6',
  '#79706E',
  '#499894',
  '#B6992D',
  '#D37295',
  '#9D7660',
  '#637939',
  '#8C564B',
  '#9467BD',
  '#17BECF',
  '#BCBD22',
  '#E377C2',
];

export function getChartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

// Semantic colors from the palette for charts that show successes and failures.
export const CHART_COLOR_SUCCESS = '#59A14F';
export const CHART_COLOR_FAILURE = '#E15759';
