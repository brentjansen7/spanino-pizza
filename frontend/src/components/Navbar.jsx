import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../api/client.js';

const navigatieItems = [
  { pad: '/', label: 'Dashboard', icoon: '📊' },
  { pad: '/feestverzoeken', label: 'Feestverzoeken', icoon: '🎉' },
  { pad: '/facturen', label: 'Facturen', icoon: '📄' },
  { pad: '/klanten', label: 'Klanten', icoon: '👥' },
  { pad: '/templates', label: 'Templates', icoon: '✉️' },
  { pad: '/instellingen', label: 'Instellingen', icoon: '⚙️' },
];

export default function Navbar() {
  const locatie = useLocation();
  const navigeer = useNavigate();

  async function uitloggen() {
    await authApi.logout();
    navigeer('/login');
  }

  return (
    <nav className="bg-pizza-dark text-white w-64 min-h-screen flex flex-col">
      <div className="p-6 border-b border-blue-900">
        <div className="text-2xl font-bold text-pizza-red">🍕 Spanino</div>
        <div className="text-sm text-gray-400 mt-1">Pizza Beheer</div>
      </div>

      <ul className="flex-1 py-4">
        {navigatieItems.map((item) => {
          const actief = locatie.pathname === item.pad ||
            (item.pad !== '/' && locatie.pathname.startsWith(item.pad));
          return (
            <li key={item.pad}>
              <Link
                to={item.pad}
                className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                  actief
                    ? 'bg-pizza-red text-white font-semibold'
                    : 'text-gray-300 hover:bg-blue-900 hover:text-white'
                }`}
              >
                <span>{item.icoon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="p-4 border-t border-blue-900">
        <button
          onClick={uitloggen}
          className="w-full text-left text-sm text-gray-400 hover:text-white transition-colors px-2 py-2"
        >
          🚪 Uitloggen
        </button>
      </div>
    </nav>
  );
}
