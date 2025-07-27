import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Page } from 'src/components';
import { texts } from 'src/texts';
import { useRatings, useUsage } from './hooks';

export function DashboardPage() {
  const statsUsage = useUsage();
  const statsRatings = useRatings();

  return (
    <Page>
      <h2 className="mb-4 text-3xl">{texts.common.dashboard}</h2>

      <div className="card mb-4 bg-base-100 shadow">
        <div className="card-body">
          <h3 className="mb-2 text-lg">{texts.dashboard.tokensTotalChat}</h3>

          <ResponsiveContainer height={300}>
            <BarChart width={800} height={5400} data={statsUsage.items}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />

              <Bar dataKey="total" fill="#003f5c" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card mb-4 bg-base-100 shadow">
        <div className="card-body">
          <h3 className="mb-2 text-lg">{texts.dashboard.tokensPerModelChart}</h3>

          <ResponsiveContainer height={300}>
            <BarChart width={800} height={500} data={statsUsage.items}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />

              {statsUsage.byModel.map((b) => (
                <Bar key={b.key} dataKey={b.dataKey} name={b.key} fill={b.color} />
              ))}

              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h3 className="mb-2 text-lg">{texts.dashboard.ratings}</h3>

          <ResponsiveContainer height={300}>
            <BarChart width={800} height={500} data={statsRatings.items}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />

              {statsRatings.byCategory.map((b) => (
                <Bar key={b.key} dataKey={b.dataKey} name={b.key} fill={b.color} />
              ))}

              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Page>
  );
}
