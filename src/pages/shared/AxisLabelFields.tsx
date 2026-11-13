import { Disclosure, TextField } from '../../ui';
import type { AxisLabels } from './axisLabels';

/** Custom axis titles, collapsed by default. */
export function AxisLabelFields({
  labels,
  onChange,
}: {
  labels: AxisLabels;
  onChange: (labels: AxisLabels) => void;
}) {
  return (
    <Disclosure summary="Axis labels">
      <TextField
        label="Horizontal axis"
        value={labels.q}
        onChange={(q) => onChange({ ...labels, q })}
      />
      <TextField
        label="Vertical axis"
        value={labels.p}
        onChange={(p) => onChange({ ...labels, p })}
      />
    </Disclosure>
  );
}
