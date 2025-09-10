
"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Curated list of popular Google Fonts
const popularFonts = [
    "Roboto", "Open Sans", "Lato", "Montserrat", "Oswald", "Source Sans Pro", "Raleway", "Poppins", "Nunito", 
    "Ubuntu", "Merriweather", "PT Sans", "Playfair Display", "Lora", "Fira Sans", "Inter", "Work Sans", 
    "Zilla Slab", "IBM Plex Sans", "Space Grotesk", "DM Sans", "Sora", "Manrope", "Rubik", "Josefin Sans", 
    "Arimo", "Bitter", "Anton", "Bebas Neue", "Caveat", "Comfortaa", "Crimson Text", "Dancing Script", "Dosis", 
    "EB Garamond", "Exo 2", "Great Vibes", "Indie Flower", "Inconsolata", "Kanit", "Lobster", "M PLUS Rounded 1c", 
    "Noto Sans", "Pacifico", "Quicksand", "Righteous", "Sacramento", "Shadows Into Light", "Teko", "Yanone Kaffeesatz"
];

interface FontPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function FontPicker({ value, onChange, className }: FontPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [loadedFonts, setLoadedFonts] = React.useState<string[]>([]);

  // Dynamically load font stylesheets for previewing in the dropdown
  React.useEffect(() => {
    const fontsToLoad = popularFonts.filter(f => !loadedFonts.includes(f));
    if (fontsToLoad.length > 0) {
      fontsToLoad.forEach(fontFamily => {
        const fontId = `font-link-${fontFamily.replace(/\s+/g, '-')}`;
        if (!document.getElementById(fontId)) {
          const link = document.createElement("link");
          link.id = fontId;
          link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, "+")}&display=swap`;
          link.rel = "stylesheet";
          document.head.appendChild(link);
        }
      });
      setLoadedFonts([...loadedFonts, ...fontsToLoad]);
    }
  }, [loadedFonts]);

  const handleSelect = (currentValue: string) => {
    onChange(currentValue);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <span className="truncate" style={{ fontFamily: value }}>{value || "Select a font"}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search font..." />
          <CommandList>
            <CommandEmpty>No font found.</CommandEmpty>
            
            {value && (
                <CommandGroup heading="Current Font">
                    <CommandItem
                        key={value}
                        value={value}
                        onSelect={handleSelect}
                        onPointerDown={(e) => e.preventDefault()}
                        style={{ fontFamily: value }}
                    >
                        <Check className={cn("mr-2 h-4 w-4", "opacity-100")} />
                        {value}
                    </CommandItem>
                </CommandGroup>
            )}
            
            <CommandSeparator className={cn(!value && 'hidden')}/>

            <CommandGroup heading="All Fonts">
              {popularFonts.map((font) => (
                <CommandItem
                  key={font}
                  value={font}
                  onSelect={handleSelect}
                  onPointerDown={(e) => e.preventDefault()}
                  style={{ fontFamily: font }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === font ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {font}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
