
"use client";
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TaskItemProps {
    task: any;
    onToggle: (id: number, val: boolean) => void;
    onDelete: (id: number, isHabit: boolean, habitId?: number) => void;
    onUpdateNote: (id: number, note: string) => void;
}

const PRIORITY_STYLES = {
    0: 'bg-blue-50 text-blue-700 border-blue-100', // Low
    1: 'bg-orange-50 text-orange-700 border-orange-100', // Med
    2: 'bg-red-50 text-red-700 border-red-100' // High
};

export function TaskItem({ task, onToggle, onDelete, onUpdateNote }: TaskItemProps) {
    const [expanded, setExpanded] = useState(false);
    const [note, setNote] = useState(task.note || '');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (expanded && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [note, expanded]);

    return (
        <div className={cn(
            "group relative bg-white rounded-2xl transition-all duration-300 ease-out border",
            task.completed
                ? "border-transparent bg-gray-50/50 shadow-none opacity-60 grayscale-[0.5]"
                : "border-gray-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.1)] hover:-translate-y-0.5"
        )}>
            <div className="flex items-center p-4 gap-4">
                {/* Custom Checkbox */}
                <div
                    onClick={(e) => { e.stopPropagation(); onToggle(task.id, !task.completed); }}
                    className={cn(
                        "w-6 h-6 rounded-full border-2 flex-shrink-0 cursor-pointer flex items-center justify-center transition-all duration-300 ease-spring active:scale-75",
                        task.completed ? "bg-blue-600 border-blue-600 scale-100" : "border-gray-300 hover:border-blue-400 bg-white"
                    )}
                >
                    <svg
                        className={cn("w-3.5 h-3.5 text-white transition-all duration-300", task.completed ? "opacity-100 scale-100" : "opacity-0 scale-50")}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"
                    >
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(!expanded)}>
                    <div className="flex items-center gap-3">
                        <span className={cn(
                            "font-medium text-[17px] leading-snug truncate transition-all duration-300",
                            task.completed ? "text-gray-400 line-through decoration-gray-300" : "text-gray-900"
                        )}>
                            {task.title}
                        </span>

                        {/* Priority Dot/Badge - Google style uses small indicators or colors */}
                        {task.priority > 0 && !task.completed && (
                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border", PRIORITY_STYLES[task.priority as 0 | 1 | 2])}>
                                {task.priority === 2 ? 'High' : 'Med'}
                            </span>
                        )}
                    </div>

                    {/* Preview note if collapsed */}
                    {!expanded && note && (
                        <p className="text-sm text-gray-500 truncate mt-0.5 font-normal">{note}</p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                        className={cn("p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors", expanded && "bg-blue-50 text-blue-600")}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(task.id, !!task.habit_id, task.habit_id); }}
                        className="p-2 rounded-full hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                </div>
            </div>

            {/* Expanded Note Area - Slides down */}
            <div className={cn(
                "grid transition-all duration-300 ease-in-out",
                expanded ? "grid-rows-[1fr] opacity-100 pb-4 px-4" : "grid-rows-[0fr] opacity-0"
            )}>
                <div className="overflow-hidden">
                    <textarea
                        ref={textareaRef}
                        value={note}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setNote(e.target.value)}
                        onBlur={() => onUpdateNote(task.id, note)}
                        placeholder="Add details, subtasks, or thoughts..."
                        className="w-full bg-gray-50 border-0 rounded-xl p-3 text-gray-700 placeholder-gray-400 text-sm leading-relaxed resize-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all"
                        rows={2}
                    />
                </div>
            </div>
        </div>
    );
}
