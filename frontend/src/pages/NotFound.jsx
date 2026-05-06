import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-6">
        <svg width="36" height="36" fill="none" stroke="#6c63ff" strokeWidth="1.5" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4M12 16h.01"/>
        </svg>
      </div>
      <h1 className="text-6xl font-extrabold text-white mb-3">404</h1>
      <p className="text-gray-400 text-lg mb-8 max-w-sm">
        This page doesn't exist — or the short link has expired.
      </p>
      <Link to="/" className="btn-primary">← Back to home</Link>
    </div>
  );
}
