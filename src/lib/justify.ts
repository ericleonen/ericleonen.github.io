/**
 * Packs images into justified rows — the layout every photo gallery uses: each
 * row is filled edge to edge, every image keeps its own proportions, and nothing
 * is cropped. Rows are chosen here at build time; the actual pixel sizing is left
 * to flexbox (each item gets `flex-grow` equal to its aspect ratio), so a row
 * stays perfectly justified at any viewport width.
 */

export interface Justifiable {
  /** width / height */
  aspect: number;
}

export interface JustifyOptions {
  /** The width rows are packed against. Only affects *which* images share a row. */
  containerWidth: number;
  /** The row height to aim for. Rows end up near this, never exactly at it. */
  targetHeight: number;
  /** Gap between images, in the same units as containerWidth. */
  gap: number;
  /**
   * A trailing row shorter than this fraction of the container is left at the
   * target height instead of being stretched, so a lone final image doesn't
   * balloon to full width.
   */
  lastRowStretchThreshold?: number;
}

export interface Row<T> {
  items: T[];
  /** True when the row fills the container; false for a short trailing row. */
  justified: boolean;
}

/** The height a row of these aspect ratios takes when stretched to fill the width. */
function fittedHeight(aspects: number[], containerWidth: number, gap: number): number {
  const totalAspect = aspects.reduce((sum, a) => sum + a, 0);
  return (containerWidth - gap * (aspects.length - 1)) / totalAspect;
}

export function justifyRows<T extends Justifiable>(
  items: T[],
  { containerWidth, targetHeight, gap, lastRowStretchThreshold = 0.85 }: JustifyOptions
): Row<T>[] {
  const rows: Row<T>[] = [];
  let current: T[] = [];

  for (const item of items) {
    const withItem = [...current, item];
    // Take the item if doing so lands the row closer to the target height than
    // closing without it would. That beats "fill until it overflows", which
    // tends to cram one image too many in and squash the row.
    if (current.length > 0) {
      const heightWith = fittedHeight(withItem.map(i => i.aspect), containerWidth, gap);
      const heightWithout = fittedHeight(current.map(i => i.aspect), containerWidth, gap);
      if (Math.abs(heightWithout - targetHeight) < Math.abs(heightWith - targetHeight)) {
        rows.push({ items: current, justified: true });
        current = [item];
        continue;
      }
    }
    current = withItem;
  }

  if (current.length > 0) {
    // A nearly-full trailing row is worth stretching; a sparse one is not.
    const naturalWidth =
      current.reduce((sum, i) => sum + i.aspect * targetHeight, 0) + gap * (current.length - 1);
    rows.push({
      items: current,
      justified: naturalWidth >= containerWidth * lastRowStretchThreshold,
    });
  }

  return rows;
}
