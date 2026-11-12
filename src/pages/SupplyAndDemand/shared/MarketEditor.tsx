import type { Line } from '../../../econ/core/line';
import { Button, Disclosure, FieldRow, NumberField, PanelSection, TextField } from '../../../ui';
import { equation } from './equation';
import styles from './market.module.css';
import type { MarketState } from './useMarket';

/** Exact numeric entry for the curves, the axis labels, and a reset. */
export function MarketEditor({ state }: { state: MarketState }) {
  const { market, setDemand, setSupply, labels, setLabels, reset } = state;
  return (
    <PanelSection title="Curves">
      <LineFields name="Demand" line={market.demand} onChange={setDemand} />
      <LineFields name="Supply" line={market.supply} onChange={setSupply} />
      <Disclosure summary="Axis labels">
        <TextField
          label="Horizontal axis"
          value={labels.q}
          onChange={(q) => setLabels({ ...labels, q })}
        />
        <TextField
          label="Vertical axis"
          value={labels.p}
          onChange={(p) => setLabels({ ...labels, p })}
        />
      </Disclosure>
      <Button onClick={reset}>Reset curves</Button>
    </PanelSection>
  );
}

function LineFields({
  name,
  line,
  onChange,
}: {
  name: string;
  line: Line;
  onChange: (line: Line) => void;
}) {
  return (
    <div role="group" aria-label={name}>
      <p className={styles.lineHeading}>
        <strong>{name}</strong>
        <span>{equation(line)}</span>
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
