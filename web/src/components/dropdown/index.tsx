"use client";

import { icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DropdownButtons() {
  const Ellipsis = icons.ellipsis;
  const Trash = icons.trash;
  const Message = icons.message;
  const Add = icons.add;
  const BellPlus = icons.addAlert;

  return (
    <div className="flex gap-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Add className="h-5 w-5" />
            New
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={6}>
          <DropdownMenuItem className="flex items-center gap-2">
            <BellPlus className="h-4 w-4 text-accent" />
            Broadcast
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex items-center gap-2">
            <Message className="h-4 w-4 text-accent" />
            Channel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="h-9 w-9 p-0 rounded-full flex items-center justify-center"
          >
            <Ellipsis className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={6}>
          <DropdownMenuItem className="flex items-center gap-2">
            <Trash className="h-4 w-4 text-accent" />
            Delete
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex items-center gap-2">
            <Message className="h-4 w-4 text-accent" />
            Comment
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
