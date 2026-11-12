import { Button, PanelSection } from '../../../ui';
import { AxisLabelFields } from '../../shared/AxisLabelFields';
import { LineFields } from '../../shared/LineFields';
import type { MarketState } from './useMarket';

/** Exact numeric entry for the curves, the axis labels, and a reset. */
export function MarketEditor({ state }: { state: MarketState }) {
  const { market, setDemand, setSupply, labels, setLabels, reset } = state;
  return (
    <PanelSection title="Curves">
      <LineFields name="Demand" line={market.demand} onChange={setDemand} />
      <LineFields name="Supply" line={market.supply} onChange={setSupply} />
      <AxisLabelFields labels={labels} onChange={setLabels} />
      <Button onClick={reset}>Reset curves</Button>
    </PanelSection>
  );
}
