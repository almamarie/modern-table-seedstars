"use client";

import { Row } from "@tanstack/react-table";

interface ActionsProps<TData> {
  row: Row<TData>;
}

export function Actions<TData>({}: ActionsProps<TData>) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => {}}
        className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white text-sm"
      >
        Accept
      </button>
      <button
        onClick={() => {}}
        className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white text-sm"
      >
        Decline
      </button>
    </div>
  );
}
