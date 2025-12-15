/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PaginationData } from "@/data/pagination";
import React from "react";
import { Pagination } from "./Pagination";

export type MyTableProps = {
  columns: string[];
  data: any[];
  renderColumn?: (columnName: string) => React.ReactNode;
  renderRow: (item: any) => React.ReactNode;
  onPageChange?: (page: number) => void;
  pagination?: PaginationData;
  loading?: boolean;
};

export function MyTable({
  columns,
  renderColumn,
  data,
  renderRow,
  onPageChange,
  pagination,
  loading,
}: MyTableProps) {
  return (
    <div className="flex-1 w-full flex flex-col justify-between min-h-0">
      <div className="flex-1 overflow-y-auto min-h-0 scrollbar">
        <table>
          <thead>
            <tr>
              {renderColumn && columns.map((column) => renderColumn(column))}
              {!renderColumn &&
                columns.map((column) => <th key={column}>{column}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 && !loading && data.map((item) => renderRow(item))}
            {data.length === 0 && !loading && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-4 text-sm"
                >
                  No data available.
                </td>
              </tr>
            )}
            {loading && (
              <>
                {Array.from({ length: 20 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    {Array.from({ length: columns.length }).map(
                      (__, cellIndex) => (
                        <td key={cellIndex} className="py-2 px-4">
                          <div className="h-4 bg-accent rounded w-full"></div>
                        </td>
                      )
                    )}
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      <div className="py-2">
        {pagination && (
          <Pagination
            data={pagination}
            onPageChange={onPageChange ?? (() => {})}
          />
        )}
      </div>
    </div>
  );
}
