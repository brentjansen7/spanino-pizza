import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { klantenApi } from '../api/client.js';
import { toonToast } from '../components/Toast.jsx';

function KlantFormulier({ beginWaarden = {}, onOpslaan, laden }) {
  const [form, setForm] = useState({
    naam: '', email: '', telefoon: '', adres: '', stad: '', postcode: '', notities: '',
    ...beginWaarden,
  });

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onOpslaan(form); }} className="space-y-4 max-w-lg">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Naam *</label>
          <input name="naam" value={form.naam} onChange={handleChange} required
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
          <input name="email" type="email" value={form.email} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefoon</label>
          <input name="telefoon" value={form.telefoon} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
          <input name="adres" value={form.adres} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
          <input name="postcode" value={form.postcode} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stad</label>
          <input name="stad" value={form.stad} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notities</label>
          <textarea name="notities" value={form.notities} onChange={handleChange} rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={laden}
          className="bg-pizza-red text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50">
          {laden ? 'Opslaan...' : 'Opslaan'}
        </button>
        <Link to="/klanten" className="border px-5 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
          Annuleren
        </Link>
      </div>
    </form>
  );
}

export function KlantenLijst() {
  const [klanten, setKlanten] = useState([]);
  const [laden, setLaden] = useState(true);
  const [zoek, setZoek] = useState('');

  useEffect(() => {
    klantenApi.lijst().then(setKlanten).finally(() => setLaden(false));
  }, []);

  const gefilterd = klanten.filter((k) =>
    k.naam.toLowerCase().includes(zoek.toLowerCase()) ||
    (k.email || '').toLowerCase().includes(zoek.toLowerCase())
  );

  if (laden) return <div className="p-8 text-gray-500">Laden...</div>;

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Klanten</h1>
        <Link to="/klanten/nieuw"
          className="bg-pizza-red text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
          + Nieuwe klant
        </Link>
      </div>

      <input
        type="search" placeholder="Zoek op naam of e-mail..." value={zoek}
        onChange={(e) => setZoek(e.target.value)}
        className="w-full border rounded-lg px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-pizza-red"
      />

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {gefilterd.length === 0 ? (
          <p className="p-8 text-center text-gray-400">
            {zoek ? 'Geen klanten gevonden' : 'Nog geen klanten'}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Naam</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">E-mail</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Telefoon</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Facturen</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {gefilterd.map((k) => (
                <tr key={k.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium">{k.naam}</td>
                  <td className="px-6 py-3 text-gray-500">{k.email || '—'}</td>
                  <td className="px-6 py-3 text-gray-500">{k.telefoon || '—'}</td>
                  <td className="px-6 py-3 text-gray-500">{k._count?.facturen || 0}</td>
                  <td className="px-6 py-3 text-right">
                    <Link to={`/klanten/${k.id}`}
                      className="text-pizza-accent hover:underline text-xs">Bekijken</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export function KlantNieuw() {
  const [laden, setLaden] = useState(false);
  const navigeer = useNavigate();

  async function opslaan(data) {
    setLaden(true);
    try {
      await klantenApi.aanmaken(data);
      toonToast('Klant aangemaakt!');
      navigeer('/klanten');
    } catch (err) {
      toonToast(err.message, 'fout');
    } finally {
      setLaden(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Nieuwe klant</h1>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <KlantFormulier onOpslaan={opslaan} laden={laden} />
      </div>
    </div>
  );
}

export function KlantDetail() {
  const { id } = useParams();
  const [klant, setKlant] = useState(null);
  const [bewerken, setBewerken] = useState(false);
  const [laden, setLaden] = useState(true);
  const [opslaanLaden, setOpslaanLaden] = useState(false);
  const navigeer = useNavigate();

  useEffect(() => {
    klantenApi.ophalen(id).then(setKlant).finally(() => setLaden(false));
  }, [id]);

  async function opslaan(data) {
    setOpslaanLaden(true);
    try {
      const bijgewerkt = await klantenApi.bewerken(id, data);
      setKlant(bijgewerkt);
      setBewerken(false);
      toonToast('Klant opgeslagen!');
    } catch (err) {
      toonToast(err.message, 'fout');
    } finally {
      setOpslaanLaden(false);
    }
  }

  async function verwijderen() {
    if (!confirm(`Weet je zeker dat je ${klant.naam} wilt verwijderen?`)) return;
    try {
      await klantenApi.verwijderen(id);
      toonToast('Klant verwijderd');
      navigeer('/klanten');
    } catch (err) {
      toonToast(err.message, 'fout');
    }
  }

  if (laden) return <div className="p-8 text-gray-500">Laden...</div>;
  if (!klant) return <div className="p-8 text-gray-500">Klant niet gevonden</div>;

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/klanten" className="text-gray-400 hover:text-gray-600 text-sm">← Klanten</Link>
        <h1 className="text-2xl font-bold text-gray-800">{klant.naam}</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        {bewerken ? (
          <KlantFormulier beginWaarden={klant} onOpslaan={opslaan} laden={opslaanLaden} />
        ) : (
          <div>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['E-mail', klant.email],
                ['Telefoon', klant.telefoon],
                ['Adres', klant.adres],
                ['Stad', klant.stad],
                ['Postcode', klant.postcode],
                ['Notities', klant.notities],
              ].map(([label, waarde]) => waarde ? (
                <div key={label}>
                  <dt className="text-gray-500 font-medium">{label}</dt>
                  <dd className="mt-0.5">{waarde}</dd>
                </div>
              ) : null)}
            </dl>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setBewerken(true)}
                className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                ✏️ Bewerken
              </button>
              <button onClick={verwijderen}
                className="text-red-500 px-4 py-2 rounded-lg text-sm hover:bg-red-50 transition-colors">
                🗑️ Verwijderen
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Factuurgeschiedenis */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-700">Facturen</h2>
          <Link to={`/facturen/nieuw?klantId=${klant.id}`}
            className="text-xs bg-pizza-red text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors">
            + Nieuwe factuur
          </Link>
        </div>
        {klant.facturen?.length === 0 ? (
          <p className="text-sm text-gray-400">Nog geen facturen</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left py-2 font-medium text-gray-600">Nummer</th>
                <th className="text-left py-2 font-medium text-gray-600">Status</th>
                <th className="text-right py-2 font-medium text-gray-600">Totaal</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {klant.facturen?.map((f) => {
                const sub = f.regels.reduce((s, r) => s + r.aantal * r.eenheidsprijs, 0);
                const totaal = sub * (1 + f.btwPercentage / 100);
                return (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="py-2">
                      <Link to={`/facturen/${f.id}`} className="text-pizza-accent hover:underline">
                        {f.factuurNummer}
                      </Link>
                    </td>
                    <td className="py-2 text-gray-500">{f.status}</td>
                    <td className="py-2 text-right font-medium">
                      {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(totaal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
