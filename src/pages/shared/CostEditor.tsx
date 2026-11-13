import type { CostFunction } from '../../econ/models/cost';
import { Disclosure, FieldRow, NumberField, Slider } from '../../ui';
import { costEquation } from './cost';
import styles from './shared.module.css';

/** Fixed-cost slider plus exact entry of the whole cost function. */
export function CostEditor({
  cost,
  onChange,
}: {
  cost: CostFunction;
  onChange: (cost: CostFunction) => void;
}) {
  const set = (key: keyof CostFunction) => (value: number) => onChange({ ...cost, [key]: value });
  return (
    <>
      <Slider
        label="Fixed cost"
        value={cost.fixed}
        onChange={set('fixed')}
        min={0}
        max={40}
        step={1}
      />
      <Disclosure summary="Cost function">
        <p className={styles.lineHeading}>
          <span>{costEquation(cost)}</span>
        </p>
        <FieldRow>
          <NumberField label="Fixed (F)" value={cost.fixed} onChange={set('fixed')} step={1} />
          <NumberField label="Q term" value={cost.linear} onChange={set('linear')} />
        </FieldRow>
        <FieldRow>
          <NumberField label="Q² term" value={cost.quadratic} onChange={set('quadratic')} />
          <NumberField label="Q³ term" value={cost.cubic} onChange={set('cubic')} step={0.01} />
        </FieldRow>
      </Disclosure>
    </>
  );
}
