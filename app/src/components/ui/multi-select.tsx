import { Check, ChevronsUpDown, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export type MultiSelectOption = {
  label: string;
  value: string;
  imageUrl?: string;
};

export type MultiSelectProps = {
  options: MultiSelectOption[];
  onSearchOptions: (search: string) => Promise<void>;
  selectedValues: MultiSelectOption[];
  onChangeSelectedValues: (values: MultiSelectOption[]) => void;
  hasError?: boolean;
};

export function MultiSelect({
  options,
  onSearchOptions,
  selectedValues,
  hasError,
  onChangeSelectedValues,
}: MultiSelectProps) {
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const debounceRef = useRef<number | null>(null);

  const handleSearch = async (search: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(async () => {
      try {
        setLoading(true);
        await onSearchOptions(search);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    handleSearch("");
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "w-full flex items-center justify-between h-10! text-sm px-2 cursor-default border rounded-sm",
            hasError && "border-destructive"
          )}
        >
          <div className="flex flex-wrap gap-1">
            {selectedValues.length === 0 && !loading && (
              <span className="text-muted-foreground">Select options...</span>
            )}

            {selectedValues.map((option) => (
              <div
                className="flex items-center gap-1 border rounded-full px-2 h-7 cursor-default hover:bg-background bg-secondary"
                key={option.value}
              >
                {option.imageUrl && (
                  <img
                    src={option.imageUrl}
                    alt={option.label}
                    className="inline-block w-4 h-4 rounded-full align-middle object-fit"
                  />
                )}
                <span key={option.value}>{option.label}</span>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="link"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChangeSelectedValues(
                      selectedValues.filter((v) => v.value !== option.value)
                    );
                  }}
                >
                  <X />
                </Button>
              </div>
            ))}
          </div>

          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-[500px] p-0 z-20!">
        <Command>
          <CommandInput
            placeholder="Search options..."
            onValueChange={handleSearch}
          />
          <CommandEmpty>
            {loading ? "Loading options..." : "No options found."}
          </CommandEmpty>
          <CommandList>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  className="cursor-pointer hover:bg-secondary"
                  onSelect={() => {
                    const isSelected = selectedValues.find(
                      (v) => v.value === option.value
                    );

                    if (isSelected) {
                      onChangeSelectedValues(
                        selectedValues.filter((v) => v.value !== option.value)
                      );
                    } else {
                      onChangeSelectedValues([...selectedValues, option]);
                    }
                  }}
                >
                  <Check
                    className={cn(
                      "h-4 w-4",
                      selectedValues.find((v) => v.value === option.value)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <img
                    src={option.imageUrl}
                    alt={option.label}
                    className="inline-block w-5 h-5 mr-1 rounded-full align-middle object-fit"
                  />
                  <span>{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
