import { useState } from 'react';
import { linkService } from '../services/linkService';
import { useToast } from '../context/ToastContext';
import Loader from './Loader';

export default function ShortenForm({ onCreated }) {
  const { toast } = useToast();
  const [url, setUrl]         = useState('');
  const [alias, setAlias]     = useState('');
  const [showAlias, setShowAlias] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!url.trim()) { setError('Please enter a URL.'); return; }

    setLoading(true);
    try {
      const res = await linkService.create({
        original_url: url.trim(),
        custom_alias: alias.trim() || null,
      });
      toast.success('Short link created!');
      setUrl('');
      setAlias('');
      setShowAlias(false);
      onCreated?.(res.data.link);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="card p-5 sm:p-6 flex flex-col gap-4">
        {/* URL input row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            </span>
            <input
              id="url-input"
              type="url"
              className={`input pl-9 ${error ? 'input-error' : ''}`}
              placeholder="Paste your long URL here…"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(''); }}
              autoComplete="off"
            />
          </div>
          <button type="submit" className="btn-primary shrink-0" disabled={loading}>
            {loading ? <Loader size="sm" /> : (
              <>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
                Shorten
              </>
            )}
          </button>
        </div>

        {/* Custom alias toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAlias((s) => !s)}
            className="text-xs text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1"
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            {showAlias ? 'Remove custom alias' : 'Add custom alias'}
          </button>
        </div>

        {showAlias && (
          <div className="flex items-center gap-2 animate-in">
            <span className="text-sm text-gray-500 shrink-0">snipshort.vercel.app/r/</span>
            <input
              id="alias-input"
              type="text"
              className="input flex-1"
              placeholder="my-custom-alias"
              value={alias}
              onChange={(e) => setAlias(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
              maxLength={30}
            />
          </div>
        )}

        {error && (
          <p className="text-sm text-red-400 flex items-center gap-1.5 animate-in">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>
            </svg>
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
