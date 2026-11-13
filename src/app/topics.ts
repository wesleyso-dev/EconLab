/** One model page and where it lives. */
export interface ModelPage {
  readonly path: string;
  /** Short label for section tabs, e.g. "Tax". */
  readonly label: string;
  /** Full name for the document title and home page, e.g. "Per-unit tax". */
  readonly title: string;
}

/** A group of related models, shown as one item in the main navigation. */
export interface Topic {
  readonly id: string;
  readonly label: string;
  /** One sentence for the home page. */
  readonly summary: string;
  readonly pages: readonly ModelPage[];
}

export const TOPICS: readonly Topic[] = [
  {
    id: 'supply-and-demand',
    label: 'Supply & Demand',
    summary:
      'Equilibrium, shifts, taxes, subsidies and price controls, with surplus and deadweight loss.',
    pages: [
      { path: '/supply-and-demand/shifts', label: 'Shifts', title: 'Equilibrium and shifts' },
      { path: '/supply-and-demand/tax', label: 'Tax', title: 'Per-unit tax' },
      { path: '/supply-and-demand/subsidy', label: 'Subsidy', title: 'Per-unit subsidy' },
      {
        path: '/supply-and-demand/price-controls',
        label: 'Price controls',
        title: 'Price controls',
      },
    ],
  },
  {
    id: 'perfect-competition',
    label: 'Perfect Competition',
    summary:
      'A price-taking firm beside its market, from short-run profit to long-run equilibrium.',
    pages: [
      { path: '/perfect-competition', label: 'Perfect competition', title: 'Perfect competition' },
    ],
  },
  {
    id: 'monopoly',
    label: 'Monopoly',
    summary: 'MR = MC, the monopoly markup, profit and the deadweight loss of market power.',
    pages: [{ path: '/monopoly', label: 'Monopoly', title: 'Monopoly' }],
  },
  {
    id: 'factor-markets',
    label: 'Factor Markets',
    summary: 'Labor markets under perfect competition and monopsony.',
    pages: [
      {
        path: '/factor-markets/perfect-competition',
        label: 'Perfect competition',
        title: 'Perfectly competitive labor market',
      },
      { path: '/factor-markets/monopsony', label: 'Monopsony', title: 'Monopsony' },
    ],
  },
  {
    id: 'externalities',
    label: 'Externalities',
    summary: 'Negative and positive externalities, the socially optimal output and its correction.',
    pages: [
      {
        path: '/externalities/negative-externality',
        label: 'Negative',
        title: 'Negative externality',
      },
      {
        path: '/externalities/positive-externality',
        label: 'Positive',
        title: 'Positive externality',
      },
    ],
  },
  {
    id: 'ppf',
    label: 'PPF',
    summary: 'Production possibilities, opportunity cost and comparative advantage.',
    pages: [
      { path: '/ppf/bowed', label: 'Bowed', title: 'Bowed-out PPF' },
      { path: '/ppf/linear', label: 'Linear', title: 'Linear PPF' },
    ],
  },
];

export function findPage(pathname: string): { topic: Topic; page: ModelPage } | null {
  const path = pathname.replace(/\/+$/, '') || '/';
  for (const topic of TOPICS) {
    const page = topic.pages.find((p) => p.path === path);
    if (page) return { topic, page };
  }
  return null;
}
