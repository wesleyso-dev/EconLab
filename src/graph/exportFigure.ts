/**
 * Exports the graphs on screen as a standalone image. Styles come from CSS modules
 * and theme variables, which a downloaded file can't see, so each element's computed
 * presentation is written inline. Interactive parts (drag handles, the crosshair)
 * are marked `data-export="skip"` and left out.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';
/** Room around the graphs, including for curve labels that extend past a graph's edge. */
const PADDING = 28;

/** Presentation properties copied inline, with the initial values that can be omitted. */
const STYLE_PROPERTIES: Record<string, string | null> = {
  fill: null,
  'fill-opacity': '1',
  stroke: 'none',
  'stroke-width': '1px',
  'stroke-opacity': '1',
  'stroke-dasharray': 'none',
  'stroke-linecap': 'butt',
  'stroke-linejoin': 'miter',
  opacity: '1',
  'paint-order': 'normal',
  'font-family': null,
  'font-size': null,
  'font-weight': null,
  'font-variant-numeric': 'normal',
  'shape-rendering': 'auto',
};

export interface Figure {
  readonly svg: string;
  readonly width: number;
  readonly height: number;
}

/**
 * Every graph inside `container`, laid out as on screen (e.g. the market and firm
 * graphs side by side) on a padded background, as one SVG document.
 */
export function figureFromGraphs(container: Element): Figure | null {
  const graphs = Array.from(container.querySelectorAll<SVGSVGElement>('svg[role="img"]'));
  const first = graphs[0];
  if (!first) return null;

  const boxes = graphs.map((graph) => {
    const rect = graph.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
      width: rect.width || Number(graph.getAttribute('width')),
      height: rect.height || Number(graph.getAttribute('height')),
    };
  });
  const left = Math.min(...boxes.map((b) => b.left));
  const top = Math.min(...boxes.map((b) => b.top));
  const width = Math.max(...boxes.map((b) => b.left + b.width)) - left + 2 * PADDING;
  const height = Math.max(...boxes.map((b) => b.top + b.height)) - top + 2 * PADDING;

  const root = document.createElementNS(SVG_NS, 'svg');
  root.setAttribute('xmlns', SVG_NS);
  root.setAttribute('width', String(width));
  root.setAttribute('height', String(height));
  root.setAttribute('viewBox', `0 0 ${width} ${height}`);

  const background = document.createElementNS(SVG_NS, 'rect');
  background.setAttribute('width', '100%');
  background.setAttribute('height', '100%');
  background.setAttribute('fill', getComputedStyle(first).backgroundColor || '#ffffff');
  root.appendChild(background);

  graphs.forEach((graph, i) => {
    const box = boxes[i];
    if (!box) return;
    const copy = graph.cloneNode(true) as SVGSVGElement;
    inlineStyles(graph, copy);
    copy.querySelectorAll('[data-export="skip"]').forEach((node) => node.remove());
    copy.removeAttribute('role');
    // Curve labels may sit just past the graph's edge, as they do on screen.
    copy.setAttribute('overflow', 'visible');
    copy.setAttribute('x', String(box.left - left + PADDING));
    copy.setAttribute('y', String(box.top - top + PADDING));
    root.appendChild(copy);
  });

  return { svg: new XMLSerializer().serializeToString(root), width, height };
}

/** Copies computed presentation styles from `source` onto its clone, recursively. */
function inlineStyles(source: Element, target: Element): void {
  const computed = getComputedStyle(source);
  const declarations: string[] = [];
  for (const [property, initial] of Object.entries(STYLE_PROPERTIES)) {
    const value = computed.getPropertyValue(property);
    if (value && value !== initial) declarations.push(`${property}:${value}`);
  }
  // Classes and focusability mean nothing in a standalone file.
  target.removeAttribute('class');
  target.removeAttribute('tabindex');
  target.setAttribute('style', declarations.join(';'));

  for (let i = 0; i < source.children.length; i++) {
    const from = source.children[i];
    const to = target.children[i];
    if (from && to) inlineStyles(from, to);
  }
}

export function svgDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function downloadSvg(figure: Figure, filename: string): void {
  downloadBlob(new Blob([figure.svg], { type: 'image/svg+xml' }), filename);
}

/** Rasterizes the figure at `scale` × its size (2× keeps text sharp on most screens). */
export async function downloadPng(figure: Figure, filename: string, scale = 2): Promise<void> {
  const image = new Image();
  image.src = svgDataUrl(figure.svg);
  await image.decode();

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(figure.width * scale);
  canvas.height = Math.round(figure.height * scale);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is not available.');
  context.scale(scale, scale);
  context.drawImage(image, 0, 0);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Could not create the PNG.');
  downloadBlob(blob, filename);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  // Revoke after the click has been handled.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
