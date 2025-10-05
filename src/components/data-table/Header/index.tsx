import { Button } from "@/components/ui/button";
import SearchBar from "./SearchBar";
import { PlusIcon } from "lucide-react";

const TopHeader = () => {
  return (
    <div className="flex flex-row justify-between items-center px-8 pt-8">
      <SearchBar />

      <Button>
        <PlusIcon className="w-4 h-4 mr-1" />
        New project
      </Button>
    </div>
  );
};

export default TopHeader;
