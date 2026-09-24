export default function ContactIcon({ name }) {
  const common = { viewBox: '0 0 24 24', width: 20, height: 20, fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

  if (name === 'Viber') return <svg {...common}><path d="M4.4 5.9A8.5 8.5 0 0 1 20 10.5c0 5-3.5 8.5-8.7 8.5H7l-3.2 2 .7-4.3A8.4 8.4 0 0 1 4.4 5.9Z" /><path d="M9 8.6c.4 2.9 2.1 4.8 5.3 5.8l1.3-1.5-1.9-1.2-1.1 1c-1.2-.6-1.9-1.4-2.5-2.5l1-1.1L9.9 7.4 9 8.6Z" /></svg>;
  if (name === 'WhatsApp') return <svg {...common}><path d="M20.4 11.7a8.4 8.4 0 0 1-12.3 7.4L3.5 20.5l1.5-4.3a8.4 8.4 0 1 1 15.4-4.5Z" /><path d="M8.5 8.1c.4 3 2.8 5.4 5.8 6l1.5-1.4-2-1.2-1 1c-1.2-.5-2-1.3-2.6-2.5l1-.9-1.3-2-1.4 1Z" /></svg>;
  return <svg {...common}><path d="M20.5 16.2v3a2 2 0 0 1-2.2 2A18.7 18.7 0 0 1 2.8 5.7a2 2 0 0 1 2-2.2h3a2 2 0 0 1 2 1.7l.5 2.8a2 2 0 0 1-.6 1.7l-1.5 1.5a14.2 14.2 0 0 0 4.6 4.6l1.5-1.5a2 2 0 0 1 1.7-.6l2.8.5a2 2 0 0 1 1.7 2Z" /></svg>;
}
