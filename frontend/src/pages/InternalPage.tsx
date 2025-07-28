import { Route, Routes } from 'react-router-dom';
import { RouteWhenAdmin } from 'src/components';
import { AdminPage } from './admin/AdminPage';
import { PublicPage } from './admin/public/PublicPage';

export function InternalPage() {
  return (
    <Routes>
      <Route
        path="/admin/*"
        element={
          <RouteWhenAdmin>
            <AdminPage />
          </RouteWhenAdmin>
        }
      />

      <Route
        path="/*"
        element={
          <PublicPage />
        }
      />
    </Routes>
  );
}
