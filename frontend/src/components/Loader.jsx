export default function Loader({ fullscreen = false, size = 'md' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };

  const spinner = (
    <div className="flex items-center justify-center gap-3">
      <div className={`${sizes[size]} rounded-full border-2 border-brand-500/20 border-t-brand-500 animate-spin`} />
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-surface flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          {spinner}
          <p className="text-sm text-gray-500">Loading…</p>
        </div>
      </div>
    );
  }

  return spinner;
}
