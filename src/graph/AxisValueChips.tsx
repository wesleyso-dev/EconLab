import { CHIP_HEIGHT, type PlacedAxisValue } from './axisValues';
import { useGraph } from './context';
import styles from './graph.module.css';

/** Draws laid-out axis values, each on a surface-colored chip. */
export function AxisValueChips({ values }: { values: readonly PlacedAxisValue[] }) {
  const { plot } = useGraph();
  const bottom = plot.top + plot.height;
  return (
    <g aria-hidden="true">
      {values.map((value) => {
        // Text baselines sit 4px below the chip's center line.
        const x = value.axis === 'q' ? value.center : plot.left - 8;
        const y = value.axis === 'q' ? bottom + 18 : value.center + 4;
        const left = value.axis === 'q' ? x - value.width / 2 : x - value.width + 5;
        return (
          <g key={value.id}>
            <rect
              className={styles.axisChip}
              x={left}
              y={y - 12}
              width={value.width}
              height={CHIP_HEIGHT}
              rx={3}
            />
            <text
              className={styles.axisValue}
              x={x}
              y={y}
              textAnchor={value.axis === 'q' ? 'middle' : 'end'}
            >
              {value.text}
            </text>
          </g>
        );
      })}
    </g>
  );
}
