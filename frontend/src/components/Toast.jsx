import { useState, useEffect } from 'react';

let toastCallback = null;

export function toonToast(bericht, type = 'succes') {
  if (toastCallback) toastCallback({ bericht, type });
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    toastCallback = ({ bericht, type }) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, bericht, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };
    return () => { toastCallback = null; };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium animate-fade-in ${
            toast.type === 'fout' ? 'bg-red-600' : 'bg-green-600'
          }`}
        >
          {toast.type === 'fout' ? '❌ ' : '✅ '}{toast.bericht}
        </div>
      ))}
    </div>
  );
}
