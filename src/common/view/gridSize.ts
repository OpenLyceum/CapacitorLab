/**
 * gridSize.ts
 *
 * How to arrange N charge symbols in a rectangle of a given width and height so
 * they look evenly spread.
 *
 * Start from the density that N objects would have if spread uniformly, take the
 * row and column counts that density implies, and then pick whichever row count
 * lands closer to N — the two estimates disagree because both were rounded. The
 * fallbacks for a zero count keep a very thin plate from losing its charges
 * entirely.
 *
 * Ported from `view/IGridSizeStrategy.java` (the `CCKStrategyWithRounding`
 * variant the sim actually used), originally borrowed from PhET's Circuit
 * Construction Kit.
 */

export type GridSize = {
  readonly columns: number;
  readonly rows: number;
};

export function getGridSize(numberOfObjects: number, width: number, height: number): GridSize {
  if (numberOfObjects <= 0) {
    return { columns: 0, rows: 0 };
  }

  const alpha = Math.sqrt(numberOfObjects / width / height);
  let columns = Math.round(width * alpha);

  // Two ways to get the row count, both rounded: straight from the density, or
  // from the column count we just committed to. Keep whichever fits N better.
  const rowsFromDensity = Math.round(height * alpha);
  const rowsFromColumns = columns === 0 ? 0 : Math.round(numberOfObjects / columns);
  let rows: number;
  if (rowsFromDensity !== rowsFromColumns) {
    const errorFromDensity = Math.abs(numberOfObjects - rowsFromDensity * columns);
    const errorFromColumns = Math.abs(numberOfObjects - rowsFromColumns * columns);
    rows = errorFromDensity < errorFromColumns ? rowsFromDensity : rowsFromColumns;
  } else {
    rows = rowsFromDensity;
  }

  // A rectangle thin enough to round one dimension to zero still has to show its
  // charges, so collapse it to a single line.
  if (columns === 0) {
    columns = 1;
    rows = numberOfObjects;
  } else if (rows === 0) {
    rows = 1;
    columns = numberOfObjects;
  }

  return { columns: columns, rows: rows };
}
