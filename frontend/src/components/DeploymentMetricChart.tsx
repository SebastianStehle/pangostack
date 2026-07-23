import { format, parseISO } from 'date-fns';
import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DeploymentMetricSeriesDto } from 'src/api';
import { getChartColor } from 'src/lib';

const LEGEND_WIDTH = 220;
const CHART_HEIGHT = 250;
const CHART_MARGIN = { top: 20, right: 30, left: 20, bottom: 5 };

export interface DeploymentMetricChartProps {
  // The metric to render as a single bar or line chart.
  metric: DeploymentMetricSeriesDto;
}

export const DeploymentMetricChart = (props: DeploymentMetricChartProps) => {
  const { metric } = props;
  const unit = metric.unit ? metric.unit.toUpperCase() : null;

  const valueKeys = useMemo(() => {
    const keys = new Set<string>();

    for (const datapoint of metric.datapoints) {
      for (const key of Object.keys(datapoint.values)) {
        keys.add(key);
      }
    }

    return [...keys].sort();
  }, [metric.datapoints]);

  const data = useMemo(() => {
    return metric.datapoints.map(({ timestamp, values }) => ({
      time: format(parseISO(timestamp), 'HH:mm'),
      ...values,
    }));
  }, [metric.datapoints]);

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold">{metric.label}</h3>

      <ResponsiveContainer height={CHART_HEIGHT}>
        {metric.chart === 'line' ? (
          <LineChart data={data} margin={CHART_MARGIN}>
            {renderAxes(unit)}
            {valueKeys.map((key, index) => (
              <Line key={key} type="monotone" dataKey={key} stroke={getChartColor(index)} name={key} dot={false} connectNulls />
            ))}
          </LineChart>
        ) : (
          <BarChart data={data} margin={CHART_MARGIN}>
            {renderAxes(unit)}
            {valueKeys.map((key, index) => (
              <Bar key={key} dataKey={key} fill={getChartColor(index)} name={key} />
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

function renderAxes(unit: string | null) {
  return (
    <>
      <CartesianGrid key="grid" strokeDasharray="3 3" />
      <XAxis key="x" dataKey="time" />
      <YAxis key="y" label={unit ? { value: unit, angle: -90, position: 'insideLeft' } : undefined} />
      <Tooltip key="tooltip" formatter={(value) => (unit ? `${value} ${unit}` : value)} />
      <Legend
        align="right"
        key="legend"
        layout="vertical"
        verticalAlign="middle"
        version={undefined}
        width={LEGEND_WIDTH}
        wrapperStyle={{ maxHeight: CHART_HEIGHT, overflowY: 'auto', paddingLeft: 16 }}
      />
    </>
  );
}
