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
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pizza-red rounded-xl flex items-center justify-center text-xl shadow-lg shadow-red-900/40 shrink-0">
            🍕
          </div>
          <div>
            <div className="text-base font-bold text-white leading-tight">Spanino</div>
            <div className="text-xs text-gray-400">Pizza Beheer</div>
          </div>
        </div>
      </div>

      <ul className="flex-1 py-4 space-y-0.5">
        <li className="px-6 pb-1">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Menu</p>
        </li>
        {navigatieItems.map((item) => {
          const actief = locatie.pathname === item.pad ||
            (item.pad !== '/' && locatie.pathname.startsWith(item.pad));
          return (
            <li key={item.pad} className="px-3">
              <Link
                to={item.pad}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                  actief
                    ? 'bg-pizza-red text-white font-semibold shadow-md shadow-red-900/30'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-base leading-none">{item.icoon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="p-3 border-t border-white/10">
        <button
          onClick={uitloggen}
          className="w-full flex items-center gap-3 text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-150 px-3 py-2.5 rounded-xl"
        >
          🚪 <span>Uitloggen</span>
        </button>
      </div>
    </nav>
  );
}
