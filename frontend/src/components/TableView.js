import React, { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import Avatar from './Avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

const TableView = ({ 
  data, 
  columns, 
  selectedItems = [], 
  onSelectItem, 
  onSelectAll,
  onSort,
  currentSort = { column: null, direction: 'asc' },
  actions 
}) => {
  const [hoveredRow, setHoveredRow] = useState(null);

  const handleSort = (columnKey) => {
    if (columns.find(col => col.key === columnKey)?.sortable === false) return;
    
    const newDirection = 
      currentSort.column === columnKey && currentSort.direction === 'asc' 
        ? 'desc' 
        : 'asc';
    
    onSort?.(columnKey, newDirection);
  };

  const getSortIcon = (columnKey) => {
    if (currentSort.column !== columnKey) {
      return <ArrowUpDown className="h-3 w-3 text-gray-400" />;
    }
    return currentSort.direction === 'asc' 
      ? <ArrowUp className="h-3 w-3 text-marigold" />
      : <ArrowDown className="h-3 w-3 text-marigold" />;
  };

  const allSelected = data.length > 0 && selectedItems.length === data.length;
  const someSelected = selectedItems.length > 0 && selectedItems.length < data.length;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {onSelectItem && (
              <th className="px-4 py-3 text-left w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={input => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={(e) => onSelectAll?.(e.target.checked)}
                  className="rounded border-gray-300 text-marigold focus:ring-marigold"
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${
                  column.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''
                }`}
                onClick={() => column.sortable !== false && handleSort(column.key)}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {column.sortable !== false && getSortIcon(column.key)}
                </div>
              </th>
            ))}
            {actions && <th className="px-4 py-3 text-left w-32">Actions</th>}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => {
            const isSelected = selectedItems.includes(row.id || row.student_id);
            return (
              <tr
                key={row.id || row.student_id || index}
                className={`transition-colors ${
                  hoveredRow === index ? 'bg-amber-50' : ''
                } ${isSelected ? 'bg-blue-50' : ''}`}
                onMouseEnter={() => setHoveredRow(index)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {onSelectItem && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => onSelectItem(row.id || row.student_id, e.target.checked)}
                      className="rounded border-gray-300 text-marigold focus:ring-marigold"
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-sm">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-3 text-sm">
                    {actions(row)}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {data.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No data available</p>
        </div>
      )}
    </div>
  );
};

export default TableView;
