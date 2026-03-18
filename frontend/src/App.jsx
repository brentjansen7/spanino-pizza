import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { authApi } from './api/client.js';
import Navbar from './components/Navbar.jsx';
import ToastContainer from './components/Toast.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { KlantenLijst, KlantNieuw, KlantDetail } from './pages/Klanten.jsx';
import { FacturenLijst, FactuurNieuw, FactuurDetail } from './pages/Facturen.jsx';
import { FeestverzoekenLijst, FeestverzoekNieuw, FeestverzoekDetail } from './pages/Feestverzoeken.jsx';
import Templates from './pages/Templates.jsx';
import Instellingen from './pages/Instellingen.jsx';

function Layout() {
  return (
    <div className="flex min-h-screen">
      <Navbar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

function PrivateRoute({ ingelogd, laden }) {
  if (laden) return <div className="min-h-screen flex items-center justify-center text-gray-400">Laden...</div>;
  if (!ingelogd) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export default function App() {
  const [ingelogd, setIngelogd] = useState(false);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    authApi.status().then(data => {
      setIngelogd(data?.ingelogd || false);
    }).catch(() => {
      setIngelogd(false);
    }).finally(() => setLaden(false));
  }, []);

  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<PrivateRoute ingelogd={ingelogd} laden={laden} />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/klanten" element={<KlantenLijst />} />
            <Route path="/klanten/nieuw" element={<KlantNieuw />} />
            <Route path="/klanten/:id" element={<KlantDetail />} />
            <Route path="/facturen" element={<FacturenLijst />} />
            <Route path="/facturen/nieuw" element={<FactuurNieuw />} />
            <Route path="/facturen/:id" element={<FactuurDetail />} />
            <Route path="/feestverzoeken" element={<FeestverzoekenLijst />} />
            <Route path="/feestverzoeken/nieuw" element={<FeestverzoekNieuw />} />
            <Route path="/feestverzoeken/:id" element={<FeestverzoekDetail />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/instellingen" element={<Instellingen />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
