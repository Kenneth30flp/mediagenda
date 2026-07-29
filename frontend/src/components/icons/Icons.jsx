const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
};

export function PlusIcon({ className = 'h-4 w-4' }) {
  return <svg {...base} className={className}><path d="M12 5v14M5 12h14" /></svg>;
}

export function CalendarIcon({ className = 'h-4 w-4' }) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
      <path d="M3 9.5h18M8 3v3M16 3v3" />
    </svg>
  );
}

export function UsersIcon({ className = 'h-4 w-4' }) {
  return (
    <svg {...base} className={className}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.8 20c.7-3.4 3.2-5.4 6.2-5.4s5.5 2 6.2 5.4M16 8.2a3 3 0 1 1 3.6 2.94M21.2 20c-.4-2.1-1.5-3.7-3.1-4.6" />
    </svg>
  );
}

export function ClipboardIcon({ className = 'h-4 w-4' }) {
  return (
    <svg {...base} className={className}>
      <rect x="5" y="4.5" width="14" height="16" rx="2" />
      <path d="M9 4.5V3.5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 3.5v1M8.5 11h7M8.5 15h7" />
    </svg>
  );
}

export function SearchIcon({ className = 'h-4 w-4' }) {
  return (
    <svg {...base} className={className}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M20 20l-4.6-4.6" />
    </svg>
  );
}

export function RefreshIcon({ className = 'h-4 w-4' }) {
  return (
    <svg {...base} className={className}>
      <path d="M20 11a8 8 0 0 0-14.6-4.6M4 5v5h5M4 13a8 8 0 0 0 14.6 4.6M20 19v-5h-5" />
    </svg>
  );
}

export function ClockIcon({ className = 'h-4 w-4' }) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.2 2" />
    </svg>
  );
}

export function CheckIcon({ className = 'h-4 w-4' }) {
  return <svg {...base} className={className}><path d="M4 12.5l5 5L20 6" /></svg>;
}

export function XIcon({ className = 'h-4 w-4' }) {
  return <svg {...base} className={className}><path d="M6 6l12 12M18 6L6 18" /></svg>;
}

export function PulseIcon({ className = 'h-4 w-4' }) {
  return <svg {...base} className={className}><path d="M2.5 12h4l2-6 3 12 2-9 1.5 3h6.5" /></svg>;
}
