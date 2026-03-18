import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { feestApi } from '../api/client.js';
import { toonToast } from '../components/Toast.jsx';
import EmailVoorbeeldModal from '../components/EmailVoorbeeldModal.jsx';

const typeOpties = ['Verjaardag', 'Bruiloft', 'Bedrijfsfeest', 'Kinderfeestje', 'Jubileum', 'Anders'];

function statusKleur(status) {
  if (status === 'nieuw') return 'bg-yellow-100 text-yellow-700';
  if (status === 'beantwoord') return 'bg-green-100 text-green-700';
  return 'bg-gray-100 text-gray-500';
}

function FeestFormulier({ beginWaarden = {}, onOpslaan, laden }) {
  const [form, setForm] = useState({
    naam: '', email: '', telefoon: '', datumEvenement: '', aantalPersonen: '',
    typeEvenement: '', bericht: '',
    ...beginWaarden,
    datumEvenement: beginWaarden.datumEvenement
      ? new Date(beginWaarden.datumEvenement).toISOString().split('T')[0]
      : '',
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onOpslaan(form); }} className="space-y-4 max-w-lg">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Naam aanvrager *</label>
          <input name="naam" value={form.naam} onChange={(e) => setForm(f => ({...f, naam: e.target.value}))} required
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
          <input name="email" type="email" value={form.email} onChange={(e) => setForm(f => ({...f, email: e.target.value}))} required
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefoon</label>
          <input value={form.telefoon} onChange={(e) => setForm(f => ({...f, telefoon: e.target.value}))}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Datum evenement</label>
          <input type="date" value={form.datumEvenement} onChange={(e) => setForm(f => ({...f, datumEvenement: e.target.value}))}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Aantal personen</label>
          <input type="number" min="1" value={form.aantalPersonen} onChange={(e) => setForm(f => ({...f, aantalPersonen: e.target.value}))}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type evenement</label>
          <select value={form.typeEvenement} onChange={(e) => setForm(f => ({...f, typeEvenement: e.target.value}))}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red">
            <option value="">Selecteer...</option>
            {typeOpties.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Bericht / bijzonderheden</label>
          <textarea value={form.bericht} onChange={(e) => setForm(f => ({...f, bericht: e.target.value}))} rows={4}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={laden}
          className="bg-pizza-red text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
          {laden ? 'Opslaan...' : 'Opslaan'}
        </button>
        <Link to="/feestverzoeken" className="border px-5 py-2 rounded-lg text-sm hover:bg-gray-50">Annuleren</Link>
      </div>
    </form>
  );
}

export function FeestverzoekenLijst() {
  const [verzoeken, setVerzoeken] = useState([]);
  const [laden, setLaden] = useState(true);
  const [filter, setFilter] = useState('alle');

  useEffect(() => {
    feestApi.lijst().then(setVerzoeken).finally(() => setLaden(false));
  }, []);

  const gefilterd = filter === 'alle' ? verzoeken : verzoeken.filter(v => v.status === filter);

  if (laden) return <div className="p-8 text-gray-500">Laden...</div>;

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Feestverzoeken</h1>
        <Link to="/feestverzoeken/nieuw"
          className="bg-pizza-red text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700">
          + Nieuw verzoek invoeren
        </Link>
      </div>

      <div className="flex gap-2 mb-4">
        {['alle', 'nieuw', 'beantwoord', 'gearchiveerd'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
              filter === s ? 'bg-pizza-dark text-white' : 'bg-white border hover:bg-gray-50'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {gefilterd.length === 0 ? (
          <p className="p-8 text-center text-gray-400">Geen verzoeken</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Naam</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Datum</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Personen</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {gefilterd.map(v => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium">{v.naam}</td>
                  <td className="px-6 py-3 text-gray-500">{v.typeEvenement || '—'}</td>
                  <td className="px-6 py-3 text-gray-500">
                    {v.datumEvenement ? new Intl.DateTimeFormat('nl-NL').format(new Date(v.datumEvenement)) : '—'}
                  </td>
                  <td className="px-6 py-3 text-gray-500">{v.aantalPersonen || '—'}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusKleur(v.status)}`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Link to={`/feestverzoeken/${v.id}`} className="text-pizza-accent hover:underline text-xs">
                      Bekijken
                    </Link>
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

export function FeestverzoekNieuw() {
  const [laden, setLaden] = useState(false);
  const navigeer = useNavigate();

  async function opslaan(data) {
    setLaden(true);
    try {
      await feestApi.aanmaken(data);
      toonToast('Feestverzoek opgeslagen!');
      navigeer('/feestverzoeken');
    } catch (err) {
      toonToast(err.message, 'fout');
    } finally {
      setLaden(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Nieuw feestverzoek invoeren</h1>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <FeestFormulier onOpslaan={opslaan} laden={laden} />
      </div>
    </div>
  );
}

export function FeestverzoekDetail() {
  const { id } = useParams();
  const [verzoek, setVerzoek] = useState(null);
  const [laden, setLaden] = useState(true);
  const [bewerken, setBewerken] = useState(false);
  const [preview, setPreview] = useState(null);
  const [verstuurLaden, setVerstuurLaden] = useState(false);
  const navigeer = useNavigate();

  useEffect(() => {
    feestApi.ophalen(id).then(setVerzoek).finally(() => setLaden(false));
  }, [id]);

  async function opslaan(data) {
    try {
      const bijgewerkt = await feestApi.bewerken(id, data);
      setVerzoek(bijgewerkt);
      setBewerken(false);
      toonToast('Opgeslagen!');
    } catch (err) {
      toonToast(err.message, 'fout');
    }
  }

  async function openPreview() {
    try {
      const data = await feestApi.previewEmail(id);
      setPreview(data);
    } catch (err) {
      toonToast(err.message, 'fout');
    }
  }

  async function verstuurEmail() {
    setVerstuurLaden(true);
    try {
      await feestApi.verstuurEmail(id);
      toonToast(`E-mail verstuurd naar ${verzoek.email}!`);
      setPreview(null);
      const bijgewerkt = await feestApi.ophalen(id);
      setVerzoek(bijgewerkt);
    } catch (err) {
      toonToast(err.message, 'fout');
    } finally {
      setVerstuurLaden(false);
    }
  }

  async function verwijderen() {
    if (!confirm('Weet je zeker dat je dit verzoek wilt verwijderen?')) return;
    try {
      await feestApi.verwijderen(id);
      toonToast('Verzoek verwijderd');
      navigeer('/feestverzoeken');
    } catch (err) {
      toonToast(err.message, 'fout');
    }
  }

  if (laden) return <div className="p-8 text-gray-500">Laden...</div>;
  if (!verzoek) return <div className="p-8 text-gray-500">Niet gevonden</div>;

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/feestverzoeken" className="text-gray-400 hover:text-gray-600 text-sm">← Feestverzoeken</Link>
        <h1 className="text-2xl font-bold text-gray-800">Feestverzoek: {verzoek.naam}</h1>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusKleur(verzoek.status)}`}>
          {verzoek.status}
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
        {bewerken ? (
          <FeestFormulier beginWaarden={verzoek} onOpslaan={opslaan} laden={false} />
        ) : (
          <div>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Naam', verzoek.naam],
                ['E-mail', verzoek.email],
                ['Telefoon', verzoek.telefoon],
                ['Type evenement', verzoek.typeEvenement],
                ['Datum evenement', verzoek.datumEvenement ? new Intl.DateTimeFormat('nl-NL').format(new Date(verzoek.datumEvenement)) : null],
                ['Aantal personen', verzoek.aantalPersonen],
              ].filter(([, w]) => w).map(([l, w]) => (
                <div key={l}>
                  <dt className="text-gray-500 font-medium">{l}</dt>
                  <dd className="mt-0.5">{w}</dd>
                </div>
              ))}
              {verzoek.bericht && (
                <div className="col-span-2">
                  <dt className="text-gray-500 font-medium">Bericht</dt>
                  <dd className="mt-0.5 whitespace-pre-wrap">{verzoek.bericht}</dd>
                </div>
              )}
            </dl>

            <div className="flex gap-3 mt-6 flex-wrap">
              <button onClick={openPreview}
                className="bg-pizza-red text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700">
                📤 Standaard e-mail versturen
              </button>
              <button onClick={() => setBewerken(true)}
                className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
                ✏️ Bewerken
              </button>
              <button onClick={verwijderen}
                className="text-red-500 px-4 py-2 rounded-lg text-sm hover:bg-red-50">
                🗑️ Verwijderen
              </button>
            </div>

            {verzoek.emailVerstuurdOp && (
              <p className="text-xs text-gray-400 mt-3">
                E-mail verstuurd op {new Intl.DateTimeFormat('nl-NL', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(verzoek.emailVerstuurdOp))}
              </p>
            )}
          </div>
        )}
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
