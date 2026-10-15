'use client';

import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils";

interface Option {
  value: string
  label: string
}

interface ThemeSelectProps {
  name: string
  value: string
  onChange: (e: { target: { name: string; value: string } }) => void
  options: Option[]
  placeholder?: string
  className?: string
  contentClassName?: string
  disabled?: boolean
}

export function ThemeSelect({
  name,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  className,
  contentClassName,
  disabled = false,
}: ThemeSelectProps) {
  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  return (
    <Select
      value={value}
      onValueChange={(val) => onChange({ target: { name, value: val || "" } })}
      disabled={disabled}
    >
      <SelectTrigger size="none" className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder}>
          {selectedLabel || placeholder}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className={contentClassName}>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
