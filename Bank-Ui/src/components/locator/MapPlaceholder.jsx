import { MapPin, Navigation } from 'lucide-react'

/** Static stand-in for a map — no maps SDK or network request is involved. */
export function MapPlaceholder() {
  return (
    <div aria-hidden className="relative h-40 overflow-hidden rounded-2xl border border-line bg-[#eef1ea]">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 320 160"
        preserveAspectRatio="xMidYMid slice"
      >
        <rect width="320" height="160" fill="#eef2ec" />
        <g stroke="#dfe5db" strokeWidth="8" fill="none">
          <path d="M-10 44 H330" />
          <path d="M-10 116 H330" />
          <path d="M78 -10 V170" />
          <path d="M212 -10 V170" />
        </g>
        <g stroke="#e6ebe3" strokeWidth="3" fill="none">
          <path d="M-10 80 H330" />
          <path d="M145 -10 V170" />
          <path d="M270 -10 V170" />
        </g>
        <path d="M-10 130 Q 90 100 160 128 T 330 112 V170 H-10 Z" fill="#dbe7ef" />
        <rect x="24" y="52" width="40" height="22" rx="3" fill="#e3e8df" />
        <rect x="230" y="56" width="52" height="18" rx="3" fill="#e3e8df" />
        <rect x="96" y="122" width="34" height="16" rx="3" fill="#e3e8df" />
      </svg>

      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full text-brand-600 drop-shadow">
        <MapPin size={28} fill="#3d3ac7" stroke="#ffffff" strokeWidth={1.8} />
      </span>
      <span className="absolute left-[26%] top-[38%] text-accent-500">
        <MapPin size={20} fill="#22d3ee" stroke="#ffffff" strokeWidth={1.8} />
      </span>
      <span className="absolute left-[74%] top-[62%] text-accent-500">
        <MapPin size={20} fill="#22d3ee" stroke="#ffffff" strokeWidth={1.8} />
      </span>

      <span className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1.5 text-[0.625rem] font-semibold text-ink-muted shadow-sm">
        <Navigation size={11} />
        Map preview
      </span>
    </div>
  )
}
