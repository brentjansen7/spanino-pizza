import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { facturenApi, feestApi } from '../api/client.js';

function bedrag(totaal) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(totaal || 0);
}

function berekenTotaal(factuur) {
  const sub = factuur.regels.reduce((s, r) => s + r.aantal * r.eenheidsprijs, 0);
  return sub * (1 + factuur.btwPercentage / 100);
}

export default function Dashboard() {
  const [facturen, setFacturen] = useState([]);
  const [verzoeken, setVerzoeken] = useState([]);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    async function laadData() {
      try {
        const [f, v] = await Promise.all([facturenApi.lijst(), feestApi.lijst()]);
        setFacturen(f);
        setVerzoeken(v);
      } finally {
        setLaden(false);
      }
    }
    laadData();
  }, []);

  const openFacturen = facturen.filter((f) => f.status === 'verstuurd');
  const openBedrag = openFacturen.reduce((s, f) => s + berekenTotaal(f), 0);
  const nieuweVerzoeken = verzoeken.filter((v) => v.status === 'nieuw');

  if (laden) return <div className="p-8 text-gray-500">Laden...</div>;

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">
          {new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Overzichtkaarten */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-6 border-l-4 border-pizza-red">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Openstaande facturen</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{openFacturen.length}</p>
              <p className="text-sm text-gray-500 mt-1">{bedrag(openBedrag)} te ontvangen</p>
            </div>
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-lg shrink-0">📄</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-6 border-l-4 border-yellow-400">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Nieuwe feestverzoeken</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{nieuweVerzoeken.length}</p>
              <p className="text-sm text-gray-500 mt-1">Nog niet beantwoord</p>
            </div>
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center text-lg shrink-0">🎉</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-6 border-l-4 border-green-400">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Facturen dit jaar</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{facturen.length}</p>
              <p className="text-sm text-gray-500 mt-1">Totaal aangemaakt</p>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-lg shrink-0">✅</div>
          </div>
        </div>
      </div>

      {/* Twee kolommen */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recente feestverzoeken */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-700">Recente feestverzoeken</h2>
            <Link to="/feestverzoeken" className="text-xs text-pizza-accent hover:underline">
              Alle bekijken
            </Link>
          </div>
          {verzoeken.length === 0 ? (
            <p className="text-sm text-gray-400">Nog geen verzoeken</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {verzoeken.slice(0, 5).map((v) => (
                <li key={v.id}>
                  <Link
                    to={`/feestverzoeken/${v.id}`}
                    className="flex justify-between items-center text-sm py-2.5 group hover:text-pizza-red transition-colors"
                  >
                    <span className="font-medium text-gray-700 group-hover:text-pizza-red">{v.naam}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          v.status === 'nieuw'
                            ? 'bg-yellow-100 text-yellow-700'
                            : v.status === 'beantwoord'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {v.status}
                      </span>
                      <span className="text-gray-300 group-hover:text-pizza-red transition-colors">›</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Openstaande facturen */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-700">Openstaande facturen</h2>
            <Link to="/facturen?status=verstuurd" className="text-xs text-pizza-accent hover:underline">
              Alle bekijken
            </Link>
          </div>
          {openFacturen.length === 0 ? (
            <p className="text-sm text-gray-400">Geen openstaande facturen</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {openFacturen.slice(0, 5).map((f) => (
                <li key={f.id}>
                  <Link
                    to={`/facturen/${f.id}`}
                    className="flex justify-between items-center text-sm py-2.5 group"
                  >
                    <div>
                      <span className="font-medium text-gray-700 group-hover:text-pizza-red transition-colors">{f.klant?.naam}</span>
                      <span className="text-gray-400 text-xs ml-2">{f.factuurNummer}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">{bedrag(berekenTotaal(f))}</span>
                      <span className="text-gray-300 group-hover:text-pizza-red transition-colors">›</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Snelle acties */}
      <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Snelle acties</h2>
        <div className="flex gap-3 flex-wrap">
          <Link
            to="/feestverzoeken/nieuw"
            className="bg-pizza-red text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            🎉 Nieuw feestverzoek invoeren
          </Link>
          <Link
            to="/facturen/nieuw"
            className="bg-pizza-dark text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-900 transition-colors"
          >
            📄 Nieuwe factuur aanmaken
          </Link>
          <Link
            to="/klanten/nieuw"
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            👤 Nieuwe klant toevoegen
          </Link>
        </div>
      </div>
    </div>
  );
}
