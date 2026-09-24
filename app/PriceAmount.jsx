import CountPrice from './CountPrice';

export default function PriceAmount({ prefix, value, currency, unit, compact = false }) {
  const amount = value.toLocaleString('en-US').replaceAll(',', ' ');
  return (
    <span className={compact ? 'price-amount price-amount--compact' : 'price-amount'} role="group" aria-label={`${prefix} ${amount} ${currency}${unit || ''}`}>
      <span className="price-amount__prefix" aria-hidden="true">{prefix}</span>
      <CountPrice value={value} />
      <span className="price-amount__currency" aria-hidden="true">{currency}</span>
      {unit && <span className="price-amount__unit" aria-hidden="true">{unit}</span>}
    </span>
  );
}
