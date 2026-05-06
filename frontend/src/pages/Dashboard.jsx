import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { linkService } from '../services/linkService';
import { useToast } from '../context/ToastContext';
import ShortenForm from '../components/ShortenForm';
import LinkCard from '../components/LinkCard';
import Loader from '../components/Loader';
import { formatCount } from '../utils/helpers';

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [links, setLinks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  const fetchLinks = useCallback(async () => {
    try {
      const res = await linkService.getAll();
      setLinks(res.data.links);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLinks(); }, [fetchLinks]);

  const handleCreated = (newLink) => {
    setLinks((prev) => [newLink, ...prev]);
  };

  const handleDeleted = (id) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const filtered = links.filter(
    (l) =>
      l.original_url.toLowerCase().includes(search.toLowerCase()) ||
      l.short_code.toLowerCase().includes(search.toLowerCase())
  );

  const totalClicks = links.reduce((sum, l) => sum + l.click_count, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back, <span className="text-gray-300">{user?.name}</span>
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <div className="stat-card">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total links</p>
          <p className="text-3xl font-bold text-white mt-1">{loading ? '–' : links.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total clicks</p>
          <p className="text-3xl font-bold text-white mt-1">{loading ? '–' : formatCount(totalClicks)}</p>
        </div>
        <div className="stat-card col-span-2 sm:col-span-1">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Avg. clicks/link</p>
          <p className="text-3xl font-bold text-white mt-1">
            {loading || links.length === 0 ? '–' : formatCount(Math.round(totalClicks / links.length))}
          </p>
        </div>
      </div>

      {/* Create new link */}
      <div className="mb-8">
        <p className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Shorten a new URL</p>
        <ShortenForm onCreated={handleCreated} />
      </div>

      {/* Links section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Your links{!loading && ` (${links.length})`}
          </p>
          {links.length > 0 && (
            <div className="relative max-w-xs w-full">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                className="input pl-9 text-sm py-2"
                placeholder="Search links…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader size="lg" />
          </div>
        ) : links.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" fill="none" stroke="#6c63ff" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            </div>
            <p className="text-white font-semibold mb-2">No links yet</p>
            <p className="text-gray-500 text-sm">Paste a URL above to create your first short link.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-gray-500 text-sm">No links match your search.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((link) => (
              <LinkCard key={link.id} link={link} onDeleted={handleDeleted} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
