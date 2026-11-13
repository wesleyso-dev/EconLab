import { Button, PanelSection } from '../../../ui';
import { AxisLabelFields } from '../../shared/AxisLabelFields';
import type { Symbols } from '../../shared/equation';
import { LineFields } from '../../shared/LineFields';
import type { MarketState } from './useMarket';

/** Exact numeric entry for the curves, the axis labels, and a reset. */
export function MarketEditor({
  state,
  names = ['Demand', 'Supply'],
  symbols,
}: {
  state: MarketState;
  /** Headings for the two curves, e.g. labor demand and labor supply. */
  names?: readonly [string, string];
  symbols?: Symbols;
}) {
  const { market, setDemand, setSupply, labels, setLabels, reset } = state;
  return (
    <PanelSection title="Curves">
      <LineFields name={names[0]} line={market.demand} onChange={setDemand} symbols={symbols} />
      <LineFields name={names[1]} line={market.supply} onChange={setSupply} symbols={symbols} />
      <AxisLabelFields labels={labels} onChange={setLabels} />
      <Button onClick={reset}>Reset curves</Button>
    </PanelSection>
  );
}
