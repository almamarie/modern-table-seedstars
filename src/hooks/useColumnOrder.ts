import { useState, useEffect } from 'react';

const COLUMN_ORDER_KEY = 'table-column-order';

export function usePersistedColumnOrder(defaultOrder: string[]) {
  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(COLUMN_ORDER_KEY);
      return saved ? JSON.parse(saved) : defaultOrder;
    } catch {
      return defaultOrder;
    }
  });

  const updateColumnOrder = (newOrder: string[]) => {
    setColumnOrder(newOrder);
    try {
      localStorage.setItem(COLUMN_ORDER_KEY, JSON.stringify(newOrder));
    } catch (error) {
      console.error('Failed to save column order:', error);
    }
  };

  return [columnOrder, updateColumnOrder] as const;
}