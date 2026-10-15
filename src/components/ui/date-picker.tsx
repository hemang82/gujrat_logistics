"use client"

import React, { useState, useEffect, useRef } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"

interface DatePickerProps {
  value?: string
  onChange?: (date: string) => void
  placeholder?: string
  className?: string
}

export function DatePicker({ value, onChange, placeholder = "Pick a date", className }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Parse YYYY-MM-DD safely without UTC timezone shift
  const date = React.useMemo(() => {
    if (!value) return undefined
    const parts = value.split('-')
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10)
      const m = parseInt(parts[1], 10) - 1
      const d = parseInt(parts[2], 10)
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return new Date(y, m, d)
      }
    }
    const parsed = new Date(value)
    return isNaN(parsed.getTime()) ? undefined : parsed
  }, [value])

  // Click outside and escape key to close smoothly without any layout shift
  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "flex w-full h-9 items-center justify-between text-left font-medium text-slate-800 bg-white rounded-[8px] border border-[#64748b59] hover:bg-gray-50/50 focus-visible:outline-none focus-visible:border-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary/20 px-3 text-sm cursor-pointer select-none",
          !date && "text-slate-300 font-normal text-xs",
          className
        )}
      >
        <div className="flex items-center min-w-0 gap-2">
          <CalendarIcon className="h-4 w-4 text-brand-primary shrink-0" />
          <span className="truncate">{date ? format(date, "dd/MM/yyyy") : placeholder}</span>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-slate-400 shrink-0 transition-transform duration-150", isOpen && "rotate-180 text-brand-primary")} />
      </button>

      {isOpen && (
        <div 
          className="absolute z-50 mt-1.5 right-0 bg-white rounded-xl border border-slate-200/90 shadow-2xl p-2 animate-in fade-in-0 zoom-in-95 duration-100"
          style={{ minWidth: '270px' }}
        >
          <Calendar
            mode="single"
            selected={date}
            autoFocus={false}
            onSelect={(d) => {
              if (d) {
                const y = d.getFullYear()
                const m = String(d.getMonth() + 1).padStart(2, "0")
                const day = String(d.getDate()).padStart(2, "0")
                onChange?.(`${y}-${m}-${day}`)
              } else {
                onChange?.("")
              }
              setIsOpen(false)
            }}
          />
          <div className="flex items-center justify-between p-2 pt-2.5 border-t border-slate-100 mt-1">
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault()
                onChange?.("")
                setIsOpen(false)
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2.5 py-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Clear
            </button>
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault()
                const today = new Date()
                const y = today.getFullYear()
                const m = String(today.getMonth() + 1).padStart(2, "0")
                const day = String(today.getDate()).padStart(2, "0")
                onChange?.(`${y}-${m}-${day}`)
                setIsOpen(false)
              }}
              className="text-xs font-bold text-brand-primary hover:text-brand-primary-dark px-3 py-1 bg-brand-primary/10 rounded-lg hover:bg-brand-primary/20 transition-colors cursor-pointer"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
