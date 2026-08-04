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
            type="button"
            className={cn(
              "flex w-full h-10 items-center justify-start text-left font-semibold bg-white rounded-lg border border-gray-200 hover:bg-gray-50/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary px-3 text-sm cursor-pointer",
              !date && "text-muted-foreground",
              className
            )}
          />
        }
      >
        <CalendarIcon className="mr-2 h-4 w-4 text-brand-primary shrink-0" />
        <span className="truncate">{date ? format(date, "dd/MM/yyyy") : placeholder}</span>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-50" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => onChange?.(d ? format(d, 'yyyy-MM-dd') : '')}
        />
        <div className="flex items-center justify-between p-2 border-t border-gray-100 bg-gray-50/50">
          <button 
            onClick={() => onChange?.('')}
            className="text-xs font-semibold text-gray-500 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Clear
          </button>
          <button 
            onClick={() => onChange?.(format(new Date(), 'yyyy-MM-dd'))}
            className="text-xs font-bold text-brand-primary hover:text-brand-primary-dark px-3 py-1 bg-brand-primary/10 rounded hover:bg-brand-primary/20 transition-colors cursor-pointer"
          >
            Today
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
