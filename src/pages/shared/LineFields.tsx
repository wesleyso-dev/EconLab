import type { Line } from '../../econ/core/line';
import { FieldRow, NumberField } from '../../ui';
import { equation, type Symbols } from './equation';
import styles from './shared.module.css';

/** Intercept and slope inputs for a straight curve, headed by its equation. */
export function LineFields({
  name,
  line,
  onChange,
  symbols,
}: {
  name: string;
  line: Line;
  onChange: (line: Line) => void;
  symbols?: Symbols;
}) {
  return (
    <div role="group" aria-label={name}>
      <p className={styles.lineHeading}>
        <strong>{name}</strong>
        <span>{equation(line, symbols)}</span>
      </p>
      <FieldRow>
        <NumberField
          label="Intercept"
          value={line.intercept}
          onChange={(intercept) => onChange({ ...line, intercept })}
        />
        <NumberField
          label="Slope"
          value={line.slope}
          onChange={(slope) => onChange({ ...line, slope })}
        />
      </FieldRow>
    </div>
  );
}
