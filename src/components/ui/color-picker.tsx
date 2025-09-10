
"use client"

import * as React from "react"
import { HexAlphaColorPicker } from "react-colorful"

import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function ColorPicker({
  value,
  onChange,
  className,
}: {
  value: string
  onChange: (color: string) => void
  className?: string
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-10 w-full cursor-pointer items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
        >
          <span className="truncate">{value || "Pick a color"}</span>
          <div
            className="h-6 w-6 shrink-0 rounded-md border"
            style={{ backgroundColor: value }}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <HexAlphaColorPicker className="compact-color-picker" color={value} onChange={onChange} />
      </PopoverContent>
    </Popover>
  )
}
