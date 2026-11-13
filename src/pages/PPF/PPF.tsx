import { useUrlState } from '../../app/useUrlState';
import type { Line } from '../../econ/core/line';
import type { Poly } from '../../econ/core/poly';
import { regionBetween } from '../../econ/core/region';
import {
  classifyBundle,
  comparativeAdvantage,
  maxYAt,
  opportunityCost,
  type BundleStatus,
  type PPF as Frontier,
} from '../../econ/models/ppf';
import { Area, Curve, DragHandle, formatNumber, Graph, PointMarker } from '../../graph';
import {
  FieldRow,
  ModelLayout,
  Notice,
  NumberField,
  PanelSection,
  ResultTable,
  Segmented,
} from '../../ui';
import { AxisLabelFields } from '../shared/AxisLabelFields';

const DOMAIN = [0, 12] as const;

/**
 * Producer A can make 10 X or 10 Y. On the linear page an optional producer B makes
 * 8 X or 4 Y: A has the absolute advantage in both goods, B the comparative advantage
 * in X. The production point starts inside the frontier.
 */
const PAGE_DEFAULTS = {
  ax: 10,
  ay: 10,
  bx: 8,
  by: 4,
  px: 4,
  py: 5,
  two: 'no',
  xl: 'Good X',
  yl: 'Good Y',
};

const STATUS_TEXT: Record<BundleStatus, string> = {
  efficient:
    'is efficient: it lies on the frontier, so producing more of one good means giving up some of the other.',
  inefficient:
    'is inefficient: it lies inside the frontier, so some resources are unemployed or misallocated. More of both goods could be made.',
  unattainable:
    'is unattainable with current resources and technology. Growth (more resources or better technology) would shift the frontier out.',
};

export default function PPF({ shape }: { shape: Frontier['shape'] }) {
  const [page, update] = useUrlState(PAGE_DEFAULTS);
  const a: Frontier = { shape, maxX: page.ax, maxY: page.ay };
  const b: Frontier = { shape: 'linear', maxX: page.bx, maxY: page.by };
  const twoProducers = shape === 'linear' && page.two === 'yes';
  const valid = a.maxX > 0 && a.maxY > 0 && (!twoProducers || (b.maxX > 0 && b.maxY > 0));
  const goodX = page.xl;
  const goodY = page.yl;

  const bundle = { x: page.px, y: page.py };
  const status = valid ? classifyBundle(a, bundle) : null;
  // Opportunity cost along the frontier above the production point.
  const atX = Math.min(Math.max(bundle.x, 0), a.maxX);
  const costA = opportunityCost(a, atX);
  const costB = opportunityCost(b, 0);
  const advantage = twoProducers ? comparativeAdvantage(a, b) : null;

  const tangent: Line | null =
    shape === 'bowed' && valid
      ? (() => {
          const y = maxYAt(a, atX) ?? 0;
          return { slope: -costA.ofX, intercept: y + costA.ofX * atX };
        })()
      : null;

  const graph = (
    <Graph
      title={`${shape === 'bowed' ? 'Bowed-out' : 'Linear'} production possibilities frontier for ${goodX} and ${goodY}`}
      qDomain={DOMAIN}
      pDomain={DOMAIN}
      qLabel={goodX}
      pLabel={goodY}
      crosshair={
        valid
          ? [
              {
                label: twoProducers ? 'Producer A' : 'Frontier',
                curve: frontierPoly(a),
                color: 'var(--demand)',
                to: a.maxX,
              },
              ...(twoProducers
                ? [
                    {
                      label: 'Producer B',
                      curve: frontierPoly(b),
                      color: 'var(--supply)',
                      to: b.maxX,
                    },
                  ]
                : []),
            ]
          : undefined
      }
    >
      {valid && (
        <>
          <Area
            region={regionBetween(frontierPoly(a), [0], 0, a.maxX)}
            tone="demand"
            label="Attainable"
          />
          <Curve
            curve={frontierPoly(a)}
            to={a.maxX}
            label={twoProducers ? 'A' : 'PPF'}
            color="var(--demand)"
          />
          {twoProducers && (
            <Curve curve={frontierPoly(b)} to={b.maxX} label="B" color="var(--supply)" />
          )}
          {tangent && (
            <Curve
              curve={tangent}
              from={Math.max(0, atX - 1.5)}
              to={atX + 1.5}
              color="var(--ink-muted)"
              dashed
            />
          )}
          <PointMarker
            point={{ q: bundle.x, p: bundle.y }}
            qText={formatNumber(bundle.x)}
            pText={formatNumber(bundle.y)}
          />
          <InterceptHandles
            name={twoProducers ? 'producer A' : 'the frontier'}
            frontier={a}
            color="var(--demand)"
            goods={[goodX, goodY]}
            onChange={(maxX, maxY) => update({ ax: maxX, ay: maxY })}
          />
          {twoProducers && (
            <InterceptHandles
              name="producer B"
              frontier={b}
              color="var(--supply)"
              goods={[goodX, goodY]}
              onChange={(maxX, maxY) => update({ bx: maxX, by: maxY })}
            />
          )}
          <DragHandle
            label="Move the production point"
            color="var(--ink)"
            point={{ q: bundle.x, p: bundle.y }}
            step={0.1}
            onChange={(pt) => update({ px: pt.q, py: pt.p })}
          />
        </>
      )}
    </Graph>
  );

  const ofX = `Cost of 1 ${goodX} (in ${goodY})`;
  const ofY = `Cost of 1 ${goodY} (in ${goodX})`;

  return (
    <ModelLayout
      title={shape === 'bowed' ? 'Bowed-out PPF' : 'Linear PPF'}
      intro={
        shape === 'bowed'
          ? 'Resources are not equally good at producing both goods, so each extra unit of one good costs more and more of the other: increasing opportunity cost. The dashed line shows the slope of the frontier at the production point. Drag the point or the intercepts.'
          : 'When resources are equally suited to both goods, the opportunity cost is constant and the frontier is a straight line. Add a second producer to compare opportunity costs: each should specialize in the good it makes at the lower cost.'
      }
      graph={graph}
    >
      {shape === 'linear' && (
        <PanelSection title="Show">
          <Segmented
            label="Producers"
            value={twoProducers ? 'yes' : 'no'}
            onChange={(two) => update({ two })}
            options={[
              { value: 'no', label: 'One' },
              { value: 'yes', label: 'Two (A and B)' },
            ]}
          />
        </PanelSection>
      )}
      <PanelSection title="Results">
        {valid && status ? (
          <>
            <ResultTable
              caption="Maximum output and opportunity costs"
              columns={twoProducers ? ['A', 'B'] : ['Value']}
              current={0}
              rows={[
                {
                  label: `Most ${goodX}`,
                  values: twoProducers ? [a.maxX, b.maxX] : [a.maxX],
                },
                {
                  label: `Most ${goodY}`,
                  values: twoProducers ? [a.maxY, b.maxY] : [a.maxY],
                },
                { label: ofX, values: twoProducers ? [costA.ofX, costB.ofX] : [costA.ofX] },
                { label: ofY, values: twoProducers ? [costA.ofY, costB.ofY] : [costA.ofY] },
              ]}
            />
            <Notice>
              The point ({formatNumber(bundle.x)} {goodX}, {formatNumber(bundle.y)} {goodY}){' '}
              {STATUS_TEXT[status]}
              {shape === 'bowed' &&
                ` At ${formatNumber(atX)} ${goodX}, one more ${goodX} costs ${formatNumber(costA.ofX)} ${goodY}.`}
            </Notice>
            {advantage?.ok && (
              <Notice>
                {advantage.value.goodX === null
                  ? 'Both producers have the same opportunity costs, so neither gains from specializing.'
                  : `Producer ${advantage.value.goodX.toUpperCase()} has the comparative advantage in ${goodX} and producer ${advantage.value.goodY?.toUpperCase()} in ${goodY}: each gives up less to make that good, so both gain by specializing and trading.`}
              </Notice>
            )}
          </>
        ) : (
          <Notice>Both intercepts must be greater than zero.</Notice>
        )}
      </PanelSection>
      <PanelSection title="Frontier">
        <FieldRow>
          <NumberField
            label={`${twoProducers ? 'A: most' : 'Most'} ${goodX}`}
            value={a.maxX}
            onChange={(ax) => update({ ax })}
            step={0.5}
          />
          <NumberField
            label={`${twoProducers ? 'A: most' : 'Most'} ${goodY}`}
            value={a.maxY}
            onChange={(ay) => update({ ay })}
            step={0.5}
          />
        </FieldRow>
        {twoProducers && (
          <FieldRow>
            <NumberField
              label={`B: most ${goodX}`}
              value={b.maxX}
              onChange={(bx) => update({ bx })}
              step={0.5}
            />
            <NumberField
              label={`B: most ${goodY}`}
              value={b.maxY}
              onChange={(by) => update({ by })}
              step={0.5}
            />
          </FieldRow>
        )}
        <AxisLabelFields
          labels={{ q: goodX, p: goodY }}
          onChange={(labels) => update({ xl: labels.q, yl: labels.p })}
        />
      </PanelSection>
    </ModelLayout>
  );
}

/** The frontier as a polynomial in X: y = maxY − (maxY/maxX)·x, or maxY − (maxY/maxX²)·x². */
function frontierPoly(ppf: Frontier): Poly {
  return ppf.shape === 'linear'
    ? [ppf.maxY, -ppf.maxY / ppf.maxX]
    : [ppf.maxY, 0, -ppf.maxY / ppf.maxX ** 2];
}

/** Handles on both intercepts, each locked to its axis. */
function InterceptHandles({
  name,
  frontier,
  color,
  goods,
  onChange,
}: {
  name: string;
  frontier: Frontier;
  color: string;
  goods: [string, string];
  onChange: (maxX: number, maxY: number) => void;
}) {
  return (
    <>
      <DragHandle
        label={`Most ${goods[0]} for ${name}`}
        color={color}
        point={{ q: frontier.maxX, p: 0 }}
        axis="q"
        qBounds={[1, DOMAIN[1]]}
        step={0.5}
        onChange={(pt) => onChange(pt.q, frontier.maxY)}
      />
      <DragHandle
        label={`Most ${goods[1]} for ${name}`}
        color={color}
        point={{ q: 0, p: frontier.maxY }}
        axis="p"
        pBounds={[1, DOMAIN[1]]}
        step={0.5}
        onChange={(pt) => onChange(frontier.maxX, pt.p)}
      />
    </>
  );
}
