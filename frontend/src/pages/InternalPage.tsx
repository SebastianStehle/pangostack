import { Route, Routes } from 'react-router-dom';
import { RouteWhenAdmin, TransientNavigate } from 'src/components';
import { AdminPage } from './admin/AdminPage';
import { ChatPage } from './chat/ChatPage';

export function InternalPage() {
  return (
    <Routes>
      <Route path="/chat/*" element={<ChatPage />} />

      <Route
        path="/admin/*"
        element={
          <RouteWhenAdmin>
            <AdminPage />
          </RouteWhenAdmin>
        }
      />

      <Route path="*" element={<TransientNavigate to="/chat" />} />
    </Routes>
  );
}
