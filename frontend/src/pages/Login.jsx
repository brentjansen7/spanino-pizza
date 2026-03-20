import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/client.js';

export default function Login() {
  const [wachtwoord, setWachtwoord] = useState('');
  const [fout, setFout] = useState('');
  const [laden, setLaden] = useState(false);
  const navigeer = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setFout('');
    setLaden(true);
    try {
      await authApi.login(wachtwoord);
      window.location.href = '/';
    } catch (err) {
      setFout('Verkeerd wachtwoord. Probeer het opnieuw.');
    } finally {
      setLaden(false);
    }
  }

  return (
    <div className="min-h-screen bg-pizza-dark flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🍕</div>
          <h1 className="text-2xl font-bold text-gray-800">Spanino Pizza</h1>
          <p className="text-gray-500 text-sm mt-1">Beheerpaneel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wachtwoord
            </label>
            <input
              type="password"
              value={wachtwoord}
              onChange={(e) => setWachtwoord(e.target.value)}
              placeholder="Voer je wachtwoord in"
              className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red"
              required
              autoFocus
            />
          </div>

          {fout && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{fout}</p>
          )}

          <button
            type="submit"
            disabled={laden}
            className="w-full bg-pizza-red text-white py-2.5 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {laden ? 'Inloggen...' : 'Inloggen'}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">
          Standaard wachtwoord: <strong>spanino2026</strong>
          <br />Wijzig dit via Instellingen
        </p>
      </div>
    </div>
  );
}
