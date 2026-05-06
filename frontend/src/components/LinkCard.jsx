import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { copyToClipboard, truncateUrl, formatCount, getFavicon } from '../utils/helpers';
import { linkService } from '../services/linkService';
import { useToast } from '../context/ToastContext';

export default function LinkCard({ link, onDeleted }) {
  const { toast } = useToast();
  const [copied, setCopied]       = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const [expanded, setExpanded]   = useState(false);
  const [stats, setStats]         = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const favicon = getFavicon(link.original_url);
  const isExpired = link.expires_at && new Date(link.expires_at) < new Date();

  const handleCopy = async () => {
    const ok = await copyToClipboard(link.short_url);
    if (ok) {
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this link? This action cannot be undone.')) return;
    setDeleting(true);
    try {
      await linkService.delete(link.id);
      toast.success('Link deleted.');
      onDeleted?.(link.id);
    } catch (err) {
      toast.error(err.message);
      setDeleting(false);
    }
  };

  const handleToggleStats = async () => {
    if (expanded) { setExpanded(false); return; }
    setExpanded(true);
    if (stats) return;
    setStatsLoading(true);
    try {
      const res = await linkService.getStats(link.id);
      setStats(res.data);
    } catch (err) {
      toast.error(err.message);
      setExpanded(false);
    } finally {
      setStatsLoading(false);
    }
  };

  return (
    <div className={`card overflow-hidden transition-all duration-300 ${deleting ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="p-4 sm:p-5">
        {/* Header row */}
        <div className="flex items-start gap-3">
          {/* Favicon */}
          <div className="w-9 h-9 rounded-lg bg-surface border border-surface-border flex items-center justify-center shrink-0 overflow-hidden">
            {favicon ? (
              <img src={favicon} alt="" className="w-5 h-5" onError={(e) => (e.target.style.display = 'none')} />
            ) : (
              <svg width="16" height="16" fill="none" stroke="#6b7280" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            )}
          </div>

          {/* URLs */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={link.short_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-400 font-semibold text-sm hover:text-brand-300 transition-colors"
              >
                {link.short_url.replace(/^https?:\/\//, '')}
              </a>
              {isExpired && <span className="badge-red">Expired</span>}
            </div>
            <p className="text-gray-500 text-xs mt-0.5 truncate" title={link.original_url}>
              {truncateUrl(link.original_url)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleCopy}
              className={`btn-ghost p-2 rounded-lg ${copied ? 'text-emerald-400' : ''}`}
              title="Copy short URL"
            >
              {copied ? (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
              ) : (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                </svg>
              )}
            </button>
            <button onClick={handleDelete} className="btn-ghost p-2 rounded-lg text-red-400/60 hover:text-red-400" title="Delete link">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-border">
          <div className="flex items-center gap-4">
            {/* Click count */}
            <button
              onClick={handleToggleStats}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-brand-400 transition-colors"
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
              </svg>
              <span className="font-semibold text-white">{formatCount(link.click_count)}</span>
              <span>click{link.click_count !== 1 ? 's' : ''}</span>
            </button>

            {/* Age */}
            <span className="text-xs text-gray-600">
              {link.created_at && !isNaN(new Date(link.created_at).getTime())
                ? formatDistanceToNow(new Date(link.created_at), { addSuffix: true })
                : 'just now'}
            </span>
          </div>

          <button
            onClick={handleToggleStats}
            className="text-xs text-gray-500 hover:text-brand-400 transition-colors flex items-center gap-1"
          >
            {expanded ? 'Hide stats' : 'View stats'}
            <svg
              width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
              className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
            >
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Stats expansion panel */}
      {expanded && (
        <div className="border-t border-surface-border bg-surface px-5 py-4 animate-in">
          {statsLoading ? (
            <div className="flex justify-center py-4"><div className="w-5 h-5 rounded-full border-2 border-brand-500/20 border-t-brand-500 animate-spin" /></div>
          ) : stats ? (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Recent Clicks</p>
              {stats.recent_clicks.length === 0 ? (
                <p className="text-sm text-gray-600">No clicks recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {stats.recent_clicks.map((click, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="text-gray-600">
                        {click.created_at && !isNaN(new Date(click.created_at).getTime())
                          ? formatDistanceToNow(new Date(click.created_at), { addSuffix: true })
                          : 'some time ago'}
                      </span>
                      <span className="text-gray-700">·</span>
                      <span className="truncate max-w-[200px]" title={click.user_agent}>{click.user_agent || 'Unknown agent'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
