import { SHIFTERS, type Shifter } from '../../econ/models/shifts';
import { Select } from '../../ui';
import { NO_SHIFT } from './shifts';

/** A dropdown of the market changes that shift one curve, grouped by direction. */
export function ShifterSelect({
  label,
  curve,
  value,
  onChange,
}: {
  label: string;
  curve: Shifter['curve'];
  value: string;
  onChange: (id: string) => void;
}) {
  const options = SHIFTERS.filter((s) => s.curve === curve);
  const group = (direction: Shifter['direction']) => (
    <optgroup label={`${curve === 'demand' ? 'Demand' : 'Supply'} ${direction}s`}>
      {options
        .filter((s) => s.direction === direction)
        .map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
    </optgroup>
  );
  return (
    <Select label={label} value={value} onChange={onChange}>
      <option value={NO_SHIFT}>No change</option>
      {group('increase')}
      {group('decrease')}
    </Select>
  );
}
