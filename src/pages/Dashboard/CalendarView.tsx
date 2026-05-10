import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const numDays = daysInMonth(year, month);
  const firstDay = firstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Mock events
  const events = [
    { day: 12, title: 'App Launch', color: 'bg-indigo-500' },
    { day: 15, title: 'UI Review', color: 'bg-brand-primary' },
    { day: 20, title: 'Client Meeting', color: 'bg-rose-500' },
    { day: 20, title: 'Team Sync', color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Calendar</h2>
          <p className="text-slate-500 text-sm">Schedule and track your project milestones</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="px-4 font-bold text-slate-900 min-w-[140px] text-center">
            {monthNames[month]} {year}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-white rounded-[40px] border border-slate-100 shadow-sm flex flex-col">
        <div className="grid grid-cols-7 border-b border-slate-50">
          {days.map(day => (
            <div key={day} className="py-4 text-center font-bold text-xs text-slate-400 uppercase tracking-widest">
              {day}
            </div>
          ))}
        </div>
        
        <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto custom-scrollbar">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="border-r border-b border-slate-50 bg-slate-50/30" />
          ))}
          
          {Array.from({ length: numDays }).map((_, i) => {
            const dayNum = i + 1;
            const dayEvents = events.filter(e => e.day === dayNum);
            const isToday = new Date().getDate() === dayNum && new Date().getMonth() === month && new Date().getFullYear() === year;

            return (
              <div key={dayNum} className="border-r border-b border-slate-50 p-2 sm:p-3 min-h-[80px] sm:min-h-[120px] transition-colors hover:bg-slate-50/50 group relative">
                <div className={cn(
                  "inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold mb-2 transition-all",
                  isToday ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-110" : "text-slate-900 group-hover:bg-slate-100"
                )}>
                  {dayNum}
                </div>

                <div className="space-y-1">
                  {dayEvents.map((event, idx) => (
                    <div key={idx} className={cn(
                      "px-2 py-1 rounded-lg text-[10px] font-bold text-white truncate shadow-sm",
                      event.color
                    )}>
                      {event.title}
                    </div>
                  ))}
                </div>

                <button className="absolute bottom-2 right-2 p-1.5 bg-slate-900 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
          
          {/* Fill the remaining cells to maintain grid integrity */}
          {Array.from({ length: (7 - (numDays + firstDay) % 7) % 7 }).map((_, i) => (
            <div key={`empty-end-${i}`} className="border-r border-b border-slate-50 bg-slate-50/30" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
