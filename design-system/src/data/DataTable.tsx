import type { Key, ReactNode } from "react";

export type DataTableColumn = {
  key: string;
  label: string;
  /** Marks the actions column; on phones it renders full-width without a label. */
  actions?: boolean;
};

export type DataTableRow = {
  id: Key;
  /** Cell content keyed by column `key`. */
  cells: Record<string, ReactNode>;
};

export type DataTableProps = {
  columns: DataTableColumn[];
  rows: DataTableRow[];
  /** Shown when `rows` is empty. */
  emptyText?: string;
};

/**
 * Bordered admin table that turns into stacked labelled cards under 760px.
 */
export function DataTable({ columns, rows, emptyText = "V tomto seznamu zatím nic není." }: DataTableProps) {
  return (
    <div className="hd-table-wrap">
      <table className="hd-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!rows.length && (
            <tr>
              <td colSpan={columns.length} className="hd-table__empty">
                {emptyText}
              </td>
            </tr>
          )}
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td
                  key={column.key}
                  data-label={column.label}
                  className={column.actions ? "hd-table__actions-cell" : undefined}
                >
                  {column.actions ? <div className="hd-table__actions">{row.cells[column.key]}</div> : row.cells[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
