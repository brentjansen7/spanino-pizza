import { useEffect, useState } from 'react';
import { instellingenApi } from '../api/client.js';
import { toonToast } from '../components/Toast.jsx';

export default function Instellingen() {
  const [form, setForm] = useState({
    restaurant_naam: '', restaurant_adres: '', restaurant_stad: '',
    restaurant_postcode: '', restaurant_telefoon: '', restaurant_kvk: '',
    restaurant_btw: '', restaurant_iban: '',
    smtp_host: 'smtp.gmail.com', smtp_port: '587',
    smtp_gebruiker: '', smtp_wachtwoord: '',
    beheer_wachtwoord: '',
  });
  const [laden, setLaden] = useState(true);
  const [opslaanLaden, setOpslaanLaden] = useState(false);
  const [testLaden, setTestLaden] = useState(false);
  const [logoBestand, setLogoBestand] = useState(null);

  useEffect(() => {
    instellingenApi.ophalen().then(data => {
      setForm(f => ({ ...f, ...data, smtp_wachtwoord: data.smtp_wachtwoord || '' }));
    }).finally(() => setLaden(false));
  }, []);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function opslaan(e) {
    e.preventDefault();
    setOpslaanLaden(true);
    try {
      await instellingenApi.opslaan(form);
      if (logoBestand) {
        await instellingenApi.logoUpload(logoBestand);
        setLogoBestand(null);
      }
      toonToast('Instellingen opgeslagen!');
    } catch (err) {
      toonToast(err.message, 'fout');
    } finally {
      setOpslaanLaden(false);
    }
  }

  async function testEmail() {
    setTestLaden(true);
    try {
      await instellingenApi.testEmail();
      toonToast('Test e-mail verstuurd! Controleer je inbox.');
    } catch (err) {
      toonToast(err.message, 'fout');
    } finally {
      setTestLaden(false);
    }
  }

  if (laden) return <div className="p-8 text-gray-500">Laden...</div>;

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Instellingen</h1>

      <form onSubmit={opslaan} className="space-y-6">
        {/* Restaurantgegevens */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-700">🍕 Restaurantgegevens</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Restaurantnaam</label>
              <input name="restaurant_naam" value={form.restaurant_naam} onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
              <input name="restaurant_adres" value={form.restaurant_adres} onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
              <input name="restaurant_postcode" value={form.restaurant_postcode} onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stad</label>
              <input name="restaurant_stad" value={form.restaurant_stad} onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefoon</label>
              <input name="restaurant_telefoon" value={form.restaurant_telefoon} onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">KvK-nummer</label>
              <input name="restaurant_kvk" value={form.restaurant_kvk} onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">BTW-nummer</label>
              <input name="restaurant_btw" value={form.restaurant_btw} onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IBAN (voor facturen)</label>
              <input name="restaurant_iban" value={form.restaurant_iban} onChange={handleChange}
                placeholder="NL00 BANK 0000 0000 00"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo (voor facturen)</label>
              <input type="file" accept="image/*" onChange={e => setLogoBestand(e.target.files[0])}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-pizza-red file:text-white file:text-sm file:cursor-pointer hover:file:bg-red-700" />
              <p className="text-xs text-gray-400 mt-1">Max 2 MB. PNG of JPG aanbevolen.</p>
            </div>
          </div>
        </div>

        {/* E-mailinstellingen */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-700">✉️ E-mailinstellingen (Gmail)</h2>
          <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
            <strong>Hoe stel je Gmail in?</strong><br/>
            1. Ga naar je Google-account → Beveiliging → App-wachtwoorden<br/>
            2. Maak een nieuw app-wachtwoord aan voor "Mail"<br/>
            3. Vul dat 16-cijferige wachtwoord hieronder in (niet je normale Gmail-wachtwoord)
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Gmail-adres</label>
              <input name="smtp_gebruiker" type="email" value={form.smtp_gebruiker} onChange={handleChange}
                placeholder="jouw@gmail.com"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">App-wachtwoord</label>
              <input name="smtp_wachtwoord" type="password" value={form.smtp_wachtwoord} onChange={handleChange}
                placeholder="16-cijferig app-wachtwoord"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red" />
            </div>
          </div>
          <button type="button" onClick={testEmail} disabled={testLaden}
            className="border border-pizza-accent text-pizza-accent px-4 py-2 rounded-lg text-sm hover:bg-blue-50 disabled:opacity-50">
            {testLaden ? 'Testen...' : '🔌 Test e-mailverbinding'}
          </button>
        </div>

        {/* Beveiliging */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-700">🔒 Beveiliging</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Beheer wachtwoord
            </label>
            <input name="beheer_wachtwoord" type="password" value={form.beheer_wachtwoord} onChange={handleChange}
              placeholder="Laat leeg om hetzelfde te houden"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red" />
            <p className="text-xs text-gray-400 mt-1">Standaard: spanino2026</p>
          </div>
        </div>

        <button type="submit" disabled={opslaanLaden}
          className="bg-pizza-red text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
          {opslaanLaden ? 'Opslaan...' : 'Instellingen opslaan'}
        </button>
      </form>
    </div>
  );
}
