import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ShortenForm from '../components/ShortenForm';
import { copyToClipboard } from '../utils/helpers';
import { useToast } from '../context/ToastContext';

const features = [
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/>
      </svg>
    ),
    title: 'Custom Aliases',
    desc: 'Create memorable, branded short links with your own custom slug.',
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
      </svg>
    ),
    title: 'Click Analytics',
    desc: 'Track every click. Know when, where and how your links are performing.',
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    title: 'Secure & Fast',
    desc: 'Redis caching delivers sub-millisecond redirects. JWT + OAuth protected.',
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/>
        <rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/>
      </svg>
    ),
    title: 'Dashboard',
    desc: 'Manage all your links from a clean, centralised dashboard.',
  },
];

function QuickResult({ link }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(link.short_url);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card p-4 flex items-center gap-4 animate-slide-up">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 mb-0.5">Your short link</p>
        <a
          href={link.short_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-400 font-semibold hover:text-brand-300 transition-colors break-all"
        >
          {link.short_url}
        </a>
      </div>
      <button onClick={handleCopy} className={`btn-secondary shrink-0 ${copied ? '!border-emerald-500 !text-emerald-400' : ''}`}>
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [result, setResult] = useState(null);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-24 px-4">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-brand-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-400 text-xs font-medium mb-6 animate-in">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse-slow" />
            Backed by Redis · Sub-millisecond redirects
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight mb-5">
            Short links that
            <span className="text-gradient block sm:inline"> work at scale.</span>
          </h1>

          <p className="text-gray-400 text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
            Paste any URL, get a blazing-fast short link with analytics, custom aliases, and full control from your dashboard.
          </p>

          {/* Shorten form */}
          <div className="max-w-2xl mx-auto">
            {isAuthenticated ? (
              <div className="flex flex-col gap-4">
                <ShortenForm onCreated={setResult} />
                {result && <QuickResult link={result} />}
              </div>
            ) : (
              <div className="card p-6 text-center">
                <p className="text-gray-400 mb-4">Create an account to start shortening URLs and tracking analytics.</p>
                <div className="flex items-center justify-center gap-3">
                  <Link to="/register" className="btn-primary">Get started free</Link>
                  <Link to="/login" className="btn-secondary">Log in</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-surface-border bg-surface-card">
        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { label: 'Links created', value: '∞' },
            { label: 'Avg redirect time', value: '<5ms' },
            { label: 'Uptime', value: '99.9%' },
            { label: 'Cache hit rate', value: '~95%' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-brand-500 mb-3">Features</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-12">
            Everything you need, nothing you don't.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <div key={f.title} className="card p-5 flex flex-col gap-3 hover:border-brand-500/50 transition-colors group">
                <div className="w-11 h-11 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 group-hover:bg-brand-500/20 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-white">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!isAuthenticated && (
        <section className="pb-20 px-4">
          <div className="max-w-2xl mx-auto card p-8 sm:p-10 text-center" style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.1) 0%, rgba(0,210,255,0.05) 100%)' }}>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Ready to get started?</h2>
            <p className="text-gray-400 mb-7">Free forever. No credit card required.</p>
            <Link to="/register" className="btn-primary text-base px-8 py-3">
              Create your free account →
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
