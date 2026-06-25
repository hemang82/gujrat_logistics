"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: string
  onChange?: (date: string) => void
  placeholder?: string
  className?: string
}

export function DatePicker({ value, onChange, placeholder = "Pick a date", className }: DatePickerProps) {
  const date = value ? new Date(value) : undefined

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            className={cn(
              "flex w-full h-12 items-center justify-start text-left font-normal bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary px-3 text-sm",
              !date && "text-muted-foreground",
              className
            )}
          />
        }
      >
        <CalendarIcon className="mr-2 h-4 w-4 text-brand-primary shrink-0" />
        <span className="truncate">{date ? format(date, "PPP") : placeholder}</span>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-50" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => onChange?.(d ? format(d, 'yyyy-MM-dd') : '')}
        />
      </PopoverContent>
    </Popover>
  )
}
