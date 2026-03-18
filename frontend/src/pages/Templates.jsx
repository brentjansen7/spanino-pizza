import { useEffect, useState } from 'react';
import { templatesApi } from '../api/client.js';
import { toonToast } from '../components/Toast.jsx';

const variabelenInfo = {
  feest: ['{{naam}}', '{{email}}', '{{datum_evenement}}', '{{aantal_personen}}', '{{type_evenement}}', '{{restaurant_naam}}', '{{restaurant_telefoon}}', '{{restaurant_email}}'],
  factuur: ['{{klant_naam}}', '{{factuur_nummer}}', '{{vervaldatum}}', '{{totaal_bedrag}}', '{{restaurant_naam}}'],
};

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [geselecteerd, setGeselecteerd] = useState(null);
  const [laden, setLaden] = useState(true);
  const [opslaanLaden, setOpslaanLaden] = useState(false);

  useEffect(() => {
    templatesApi.lijst().then(data => {
      setTemplates(data);
      if (data.length > 0) setGeselecteerd(data[0]);
    }).finally(() => setLaden(false));
  }, []);

  async function opslaan() {
    setOpslaanLaden(true);
    try {
      const bijgewerkt = await templatesApi.bewerken(geselecteerd.id, {
        naam: geselecteerd.naam,
        onderwerp: geselecteerd.onderwerp,
        inhoud: geselecteerd.inhoud,
      });
      setTemplates(t => t.map(x => x.id === bijgewerkt.id ? bijgewerkt : x));
      setGeselecteerd(bijgewerkt);
      toonToast('Template opgeslagen!');
    } catch (err) {
      toonToast(err.message, 'fout');
    } finally {
      setOpslaanLaden(false);
    }
  }

  if (laden) return <div className="p-8 text-gray-500">Laden...</div>;

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">E-mailtemplates</h1>

      <div className="grid grid-cols-3 gap-6">
        {/* Template selectie */}
        <div className="space-y-2">
          {templates.map(t => (
            <button key={t.id} onClick={() => setGeselecteerd({...t})}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                geselecteerd?.id === t.id ? 'bg-pizza-dark text-white' : 'bg-white border hover:bg-gray-50'}`}>
              <div>{t.naam}</div>
              <div className={`text-xs mt-0.5 ${geselecteerd?.id === t.id ? 'text-blue-200' : 'text-gray-400'}`}>
                {t.type === 'feest' ? '🎉 Feestverzoek' : '📄 Factuur'}
              </div>
            </button>
          ))}
        </div>

        {/* Editor */}
        {geselecteerd && (
          <div className="col-span-2 space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Naam (intern)</label>
                <input value={geselecteerd.naam}
                  onChange={e => setGeselecteerd(t => ({...t, naam: e.target.value}))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Onderwerp</label>
                <input value={geselecteerd.onderwerp}
                  onChange={e => setGeselecteerd(t => ({...t, onderwerp: e.target.value}))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inhoud (HTML toegestaan)</label>
                <textarea value={geselecteerd.inhoud}
                  onChange={e => setGeselecteerd(t => ({...t, inhoud: e.target.value}))}
                  rows={16}
                  className="w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-pizza-red" />
              </div>
              <button onClick={opslaan} disabled={opslaanLaden}
                className="bg-pizza-red text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                {opslaanLaden ? 'Opslaan...' : 'Opslaan'}
              </button>
            </div>

            {/* Beschikbare variabelen */}
            <div className="bg-blue-50 rounded-xl p-4 text-sm">
              <p className="font-medium text-blue-800 mb-2">Beschikbare variabelen:</p>
              <div className="flex flex-wrap gap-2">
                {(variabelenInfo[geselecteerd.type] || []).map(v => (
                  <code key={v} className="bg-white border border-blue-200 text-blue-700 px-2 py-0.5 rounded text-xs font-mono">
                    {v}
                  </code>
                ))}
              </div>
              <p className="text-blue-600 text-xs mt-2">Klik om de variabele te kopiëren en plak deze in de inhoud.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
