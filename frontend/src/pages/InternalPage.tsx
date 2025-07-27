import { Route, Routes } from 'react-router-dom';
import { RouteWhenAdmin, TransientNavigate } from 'src/components';
import { AdminPage } from './admin/AdminPage';
import { TeamsPage } from './teams/TeamsPage';

export function InternalPage() {
  return (
    <Routes>
      <Route path="/teams/*" element={<TeamsPage />} />

      <Route
        path="/admin/*"
        element={
          <RouteWhenAdmin>
            <AdminPage />
          </RouteWhenAdmin>
        }
      />

      <Route path="*" element={<TransientNavigate to="/teams" />} />
    </Routes>
  );
}
