export default function EmailVoorbeeldModal({ preview, onVerstuur, onSluiten, laden }) {
  if (!preview) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-gray-800">E-mail preview</h2>
            <p className="text-sm text-gray-500 mt-1">
              Aan: <span className="font-medium">{preview.aan}</span>
            </p>
            <p className="text-sm text-gray-500">
              Onderwerp: <span className="font-medium">{preview.onderwerp}</span>
            </p>
          </div>
          <button
            onClick={onSluiten}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div
            className="prose max-w-none text-sm border rounded-lg p-4 bg-gray-50"
            dangerouslySetInnerHTML={{ __html: preview.inhoud }}
          />
        </div>

        <div className="p-6 border-t flex gap-3 justify-end">
          <button
            onClick={onSluiten}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuleren
          </button>
          <button
            onClick={onVerstuur}
            disabled={laden}
            className="px-5 py-2 text-sm bg-pizza-red text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium"
          >
            {laden ? 'Versturen...' : '📤 Verstuur e-mail'}
          </button>
        </div>
      </div>
    </div>
  );
}
