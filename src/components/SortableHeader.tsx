import { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";

interface SortableHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function SortableHeader<TData, TValue>({
  column,
  title,
  className,
}: SortableHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn("flex items-center space-x-2 h-full", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log("Sorting clicked for:", title);
          console.log("Current sort state:", column.getIsSorted());
          column.toggleSorting(column.getIsSorted() === "asc");
        }}
        className={cn(
          "data-[state=open]:bg-primary/10 -ml-3 h-full text-xs uppercase",
          column.getIsSorted() && "bg-primary/10"
        )}
      >
        <span>{title}</span>
        {column.getIsSorted() === "desc" && <ArrowDown className="w-4 h-4" />}
        {column.getIsSorted() === "asc" && <ArrowUp className="w-4 h-4" />}
        {!column.getIsSorted() && <ChevronsUpDown className="w-4 h-4" />}
      </Button>
    </div>
  );
}
