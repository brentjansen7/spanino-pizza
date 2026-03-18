import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { facturenApi, klantenApi } from '../api/client.js';
import { toonToast } from '../components/Toast.jsx';
import EmailVoorbeeldModal from '../components/EmailVoorbeeldModal.jsx';

function bedrag(val) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(val || 0);
}

function berekenTotalen(regels, btwPerc) {
  const sub = regels.reduce((s, r) => s + (parseFloat(r.aantal) || 0) * (parseFloat(r.eenheidsprijs) || 0), 0);
  const btw = sub * (parseFloat(btwPerc) / 100);
  return { subtotaal: sub, btw, totaal: sub + btw };
}

function statusKleur(status) {
  const kleuren = {
    concept: 'bg-gray-100 text-gray-600',
    verstuurd: 'bg-blue-100 text-blue-700',
    betaald: 'bg-green-100 text-green-700',
    verlopen: 'bg-red-100 text-red-700',
  };
  return kleuren[status] || 'bg-gray-100 text-gray-600';
}

export function FacturenLijst() {
  const [facturen, setFacturen] = useState([]);
  const [laden, setLaden] = useState(true);
  const [statusFilter, setStatusFilter] = useState('alle');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const s = searchParams.get('status');
    if (s) setStatusFilter(s);
  }, []);

  useEffect(() => {
    const s = statusFilter === 'alle' ? undefined : statusFilter;
    facturenApi.lijst(s).then(setFacturen).finally(() => setLaden(false));
  }, [statusFilter]);

  if (laden) return <div className="p-8 text-gray-500">Laden...</div>;

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Facturen</h1>
        <Link to="/facturen/nieuw"
          className="bg-pizza-red text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700">
          + Nieuwe factuur
        </Link>
      </div>

      <div className="flex gap-2 mb-4">
        {['alle', 'concept', 'verstuurd', 'betaald', 'verlopen'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              statusFilter === s ? 'bg-pizza-dark text-white' : 'bg-white border hover:bg-gray-50'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {facturen.length === 0 ? (
          <p className="p-8 text-center text-gray-400">Geen facturen</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Nummer</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Klant</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Datum</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Vervaldatum</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-6 py-3 font-medium text-gray-600">Totaal</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {facturen.map(f => {
                const { totaal } = berekenTotalen(f.regels, f.btwPercentage);
                return (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium">{f.factuurNummer}</td>
                    <td className="px-6 py-3">{f.klant?.naam || '—'}</td>
                    <td className="px-6 py-3 text-gray-500">
                      {new Intl.DateTimeFormat('nl-NL').format(new Date(f.aangemaaktOp))}
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {f.vervaldatum ? new Intl.DateTimeFormat('nl-NL').format(new Date(f.vervaldatum)) : '—'}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusKleur(f.status)}`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right font-medium">{bedrag(totaal)}</td>
                    <td className="px-6 py-3 text-right">
                      <Link to={`/facturen/${f.id}`} className="text-pizza-accent hover:underline text-xs">
                        Bekijken
                      </Link>
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

export function FactuurNieuw() {
  const [klanten, setKlanten] = useState([]);
  const [laden, setLaden] = useState(false);
  const [searchParams] = useSearchParams();
  const navigeer = useNavigate();

  const [form, setForm] = useState({
    klantId: searchParams.get('klantId') || '',
    vervaldatum: '',
    btwPercentage: '21',
    notities: '',
    regels: [{ omschrijving: '', aantal: '1', eenheidsprijs: '' }],
  });

  useEffect(() => {
    klantenApi.lijst().then(setKlanten);
  }, []);

  function voegRegelToe() {
    setForm(f => ({ ...f, regels: [...f.regels, { omschrijving: '', aantal: '1', eenheidsprijs: '' }] }));
  }

  function verwijderRegel(i) {
    setForm(f => ({ ...f, regels: f.regels.filter((_, idx) => idx !== i) }));
  }

  function updateRegel(i, veld, waarde) {
    setForm(f => {
      const regels = [...f.regels];
      regels[i] = { ...regels[i], [veld]: waarde };
      return { ...f, regels };
    });
  }

  const { subtotaal, btw, totaal } = berekenTotalen(form.regels, form.btwPercentage);

  async function opslaan(e) {
    e.preventDefault();
    setLaden(true);
    try {
      const factuur = await facturenApi.aanmaken(form);
      toonToast(`Factuur ${factuur.factuurNummer} aangemaakt!`);
      navigeer(`/facturen/${factuur.id}`);
    } catch (err) {
      toonToast(err.message, 'fout');
    } finally {
      setLaden(false);
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Nieuwe factuur</h1>
      <form onSubmit={opslaan} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-700">Klant & details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Klant *</label>
              <select value={form.klantId} onChange={e => setForm(f => ({...f, klantId: e.target.value}))} required
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red">
                <option value="">Selecteer klant...</option>
                {klanten.map(k => <option key={k.id} value={k.id}>{k.naam}</option>)}
              </select>
              <Link to="/klanten/nieuw" className="text-xs text-pizza-accent hover:underline mt-1 inline-block">
                + Nieuwe klant aanmaken
              </Link>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vervaldatum</label>
              <input type="date" value={form.vervaldatum} onChange={e => setForm(f => ({...f, vervaldatum: e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">BTW percentage (%)</label>
              <select value={form.btwPercentage} onChange={e => setForm(f => ({...f, btwPercentage: e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red">
                <option value="0">0%</option>
                <option value="9">9%</option>
                <option value="21">21%</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notities</label>
              <textarea value={form.notities} onChange={e => setForm(f => ({...f, notities: e.target.value}))} rows={2}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red" />
            </div>
          </div>
        </div>

        {/* Regelitems */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Regelitems</h2>
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 px-1">
              <div className="col-span-6">Omschrijving</div>
              <div className="col-span-2 text-center">Aantal</div>
              <div className="col-span-3 text-right">Prijs (excl. BTW)</div>
              <div></div>
            </div>
            {form.regels.map((r, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <input value={r.omschrijving} onChange={e => updateRegel(i, 'omschrijving', e.target.value)}
                  placeholder="Omschrijving" required
                  className="col-span-6 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red" />
                <input type="number" min="0.01" step="0.01" value={r.aantal} onChange={e => updateRegel(i, 'aantal', e.target.value)}
                  required className="col-span-2 border rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-pizza-red" />
                <input type="number" min="0" step="0.01" value={r.eenheidsprijs} onChange={e => updateRegel(i, 'eenheidsprijs', e.target.value)}
                  placeholder="0,00" required
                  className="col-span-3 border rounded-lg px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-pizza-red" />
                <button type="button" onClick={() => verwijderRegel(i)}
                  disabled={form.regels.length === 1}
                  className="col-span-1 text-gray-400 hover:text-red-500 disabled:opacity-30 text-lg font-bold">×</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={voegRegelToe}
            className="mt-3 text-sm text-pizza-accent hover:underline">
            + Regel toevoegen
          </button>

          {/* Totalen */}
          <div className="mt-6 border-t pt-4 text-sm space-y-1">
            <div className="flex justify-between text-gray-500">
              <span>Subtotaal</span><span>{bedrag(subtotaal)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>BTW ({form.btwPercentage}%)</span><span>{bedrag(btw)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-800 text-base border-t pt-2 mt-2">
              <span>Totaal</span><span>{bedrag(totaal)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={laden}
            className="bg-pizza-red text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
            {laden ? 'Aanmaken...' : 'Factuur aanmaken'}
          </button>
          <Link to="/facturen" className="border px-6 py-2.5 rounded-lg text-sm hover:bg-gray-50">Annuleren</Link>
        </div>
      </form>
    </div>
  );
}

export function FactuurDetail() {
  const { id } = useParams();
  const [factuur, setFactuur] = useState(null);
  const [laden, setLaden] = useState(true);
  const [preview, setPreview] = useState(null);
  const [verstuurLaden, setVerstuurLaden] = useState(false);
  const navigeer = useNavigate();

  useEffect(() => {
    facturenApi.ophalen(id).then(setFactuur).finally(() => setLaden(false));
  }, [id]);

  async function openPreview() {
    try {
      const data = await facturenApi.previewEmail(id);
      setPreview(data);
    } catch (err) {
      toonToast(err.message, 'fout');
    }
  }

  async function verstuurEmail() {
    setVerstuurLaden(true);
    try {
      await facturenApi.verstuurEmail(id);
      toonToast('Factuur verstuurd!');
      setPreview(null);
      const bijgewerkt = await facturenApi.ophalen(id);
      setFactuur(bijgewerkt);
    } catch (err) {
      toonToast(err.message, 'fout');
    } finally {
      setVerstuurLaden(false);
    }
  }

  async function markeerBetaald() {
    if (!confirm('Markeer factuur als betaald?')) return;
    try {
      await facturenApi.markeerBetaald(id);
      toonToast('Factuur gemarkeerd als betaald!');
      const bijgewerkt = await facturenApi.ophalen(id);
      setFactuur(bijgewerkt);
    } catch (err) {
      toonToast(err.message, 'fout');
    }
  }

  async function verwijderen() {
    if (!confirm('Weet je zeker dat je deze factuur wilt verwijderen?')) return;
    try {
      await facturenApi.verwijderen(id);
      toonToast('Factuur verwijderd');
      navigeer('/facturen');
    } catch (err) {
      toonToast(err.message, 'fout');
    }
  }

  if (laden) return <div className="p-8 text-gray-500">Laden...</div>;
  if (!factuur) return <div className="p-8 text-gray-500">Factuur niet gevonden</div>;

  const { subtotaal, btw, totaal } = berekenTotalen(factuur.regels, factuur.btwPercentage);

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <Link to="/facturen" className="text-gray-400 hover:text-gray-600 text-sm">← Facturen</Link>
        <h1 className="text-2xl font-bold text-gray-800">{factuur.factuurNummer}</h1>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusKleur(factuur.status)}`}>
          {factuur.status}
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <p className="text-gray-500 font-medium">Klant</p>
            <Link to={`/klanten/${factuur.klant?.id}`} className="text-pizza-accent hover:underline font-medium">
              {factuur.klant?.naam}
            </Link>
            {factuur.klant?.email && <p className="text-gray-500">{factuur.klant.email}</p>}
          </div>
          <div>
            <p className="text-gray-500 font-medium">Datum</p>
            <p>{new Intl.DateTimeFormat('nl-NL').format(new Date(factuur.aangemaaktOp))}</p>
            {factuur.vervaldatum && (
              <>
                <p className="text-gray-500 font-medium mt-2">Vervaldatum</p>
                <p>{new Intl.DateTimeFormat('nl-NL').format(new Date(factuur.vervaldatum))}</p>
              </>
            )}
          </div>
        </div>

        {/* Regelitems */}
        <table className="w-full text-sm mb-6">
          <thead className="border-b">
            <tr>
              <th className="text-left py-2 font-medium text-gray-600">Omschrijving</th>
              <th className="text-center py-2 font-medium text-gray-600 w-20">Aantal</th>
              <th className="text-right py-2 font-medium text-gray-600 w-32">Prijs</th>
              <th className="text-right py-2 font-medium text-gray-600 w-32">Totaal</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {factuur.regels.map(r => (
              <tr key={r.id}>
                <td className="py-2">{r.omschrijving}</td>
                <td className="py-2 text-center text-gray-500">{r.aantal}</td>
                <td className="py-2 text-right text-gray-500">{bedrag(r.eenheidsprijs)}</td>
                <td className="py-2 text-right font-medium">{bedrag(r.aantal * r.eenheidsprijs)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totalen */}
        <div className="border-t pt-4 text-sm space-y-1 max-w-xs ml-auto">
          <div className="flex justify-between text-gray-500">
            <span>Subtotaal</span><span>{bedrag(subtotaal)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>BTW ({factuur.btwPercentage}%)</span><span>{bedrag(btw)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-800 text-base border-t pt-2 mt-2">
            <span>Totaal</span><span>{bedrag(totaal)}</span>
          </div>
        </div>

        {factuur.notities && (
          <div className="mt-4 pt-4 border-t text-sm">
            <p className="text-gray-500 font-medium">Notities</p>
            <p className="mt-1 whitespace-pre-wrap">{factuur.notities}</p>
          </div>
        )}
      </div>

      {/* Acties */}
      <div className="flex gap-3 flex-wrap">
        <a href={facturenApi.pdfUrl(id)} target="_blank" rel="noopener noreferrer"
          className="bg-pizza-dark text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-900">
          📥 PDF downloaden
        </a>
        {factuur.klant?.email && (
          <button onClick={openPreview}
            className="bg-pizza-red text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700">
            📤 Verstuur per e-mail
          </button>
        )}
        {factuur.status !== 'betaald' && (
          <button onClick={markeerBetaald}
            className="border border-green-500 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-50">
            ✅ Markeer als betaald
          </button>
        )}
        <button onClick={verwijderen}
          className="text-red-500 px-4 py-2 rounded-lg text-sm hover:bg-red-50">
          🗑️ Verwijderen
        </button>
      </div>

      <EmailVoorbeeldModal
        preview={preview}
        onVerstuur={verstuurEmail}
        onSluiten={() => setPreview(null)}
        laden={verstuurLaden}
      />
    </div>
  );
}
