import React from "react";

interface TableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ headers, children, className = "" }) => {
  return (
    <div className={`overflow-x-auto rounded-xl border border-primary/5 shadow-soft ${className}`}>
      <table className="min-w-full divide-y divide-primary/5 bg-white text-left">
        <thead className="bg-background-soft">
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-light"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-primary/5 font-normal text-text">{children}</tbody>
      </table>
    </div>
  );
};
