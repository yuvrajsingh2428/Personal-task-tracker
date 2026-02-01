
"use client";
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Outfit } from 'next/font/google';

const outfit = Outfit({ subsets: ['latin'] });
const PRIORITY_COLORS = { 0: 'bg-blue-500', 1: 'bg-orange-500', 2: 'bg-red-500' };

export default function HistoryPage() {
    const [history, setHistory] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [expandedDate, setExpandedDate] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            try {
                const hRes = await fetch('/api/history');
                if (hRes.ok) {
                    const h = await hRes.json();
                    setHistory(h);
                } else {
                    console.error("History fetch failed", hRes.status);
                }
            } catch (e) { console.error(e); }

            try {
                const sRes = await fetch('/api/stats');
                if (sRes.ok) {
                    const s = await sRes.json();
                    setStats(s);
                }
            } catch (e) { console.error(e); }

            setLoading(false);
        }
        loadData();
    }, []);

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    if (loading) return <div className="flex h-screen items-center justify-center text-gray-400 animate-pulse bg-[#F0F4F8]">Loading...</div>;

    const filteredHistory = history.filter(day => {
        const d = new Date(day.date);
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-20">
            <header className="mb-6 pt-2 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <p className="text-gray-500 font-bold text-sm uppercase tracking-widest mb-1">Execution Log</p>
                    <h1 className={cn("text-4xl font-extrabold text-gray-900 tracking-tight", outfit.className)}>History</h1>
                </div>
                <div className="flex gap-2">
                    <select
                        value={selectedMonth}
                        onChange={e => setSelectedMonth(parseInt(e.target.value))}
                        className="bg-white border border-gray-200 text-gray-700 font-bold text-sm rounded-xl px-4 py-2 outline-none focus:border-black"
                    >
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i} value={i}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                        ))}
                    </select>
                    <select
                        value={selectedYear}
                        onChange={e => setSelectedYear(parseInt(e.target.value))}
                        className="bg-white border border-gray-200 text-gray-700 font-bold text-sm rounded-xl px-4 py-2 outline-none focus:border-black"
                    >
                        {[2024, 2025, 2026, 2027].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </header>

            {/* WEEKLY REALITY CHECK CARD */}
            <div className="bg-black text-white rounded-[2rem] p-6 mb-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11V5h-2v6h-4v2h4v6h2v-6h4v-2h-4z" /></svg>
                </div>
                <div className="relative z-10">
                    <h2 className={cn("text-lg font-bold mb-4 text-gray-200", outfit.className)}>Weekly Reality Check (Last 7 Days)</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">DSA Days</p>
                            <p className="text-3xl font-extrabold">{stats?.dsa_problems || 0}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Gym Days</p>
                            <p className="text-3xl font-extrabold">{stats?.gym_days || 0}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Dev Days</p>
                            <p className="text-3xl font-extrabold">{stats?.dev_days || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-4">
                {filteredHistory.length === 0 && <p className="text-gray-400 font-bold text-center py-10">No records for this period.</p>}
                {filteredHistory.map((day) => {
                    const completedCount = day.tasks ? day.tasks.filter((t: any) => t.completed).length : 0;
                    const totalCount = day.tasks ? day.tasks.length : 0;
                    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
                    const isExpanded = expandedDate === day.date;

                    let statusBorder = "border-gray-100";
                    if (completedCount <= 1) statusBorder = "border-red-200 bg-red-50/10";
                    else if (completedCount === 2) statusBorder = "border-yellow-200 bg-yellow-50/10";
                    else if (completedCount >= 3) statusBorder = "border-green-200 bg-green-50/10";

                    return (
                        <div key={day.date} className="group">
                            <div
                                onClick={() => setExpandedDate(isExpanded ? null : day.date)}
                                className={cn(
                                    "rounded-3xl border shadow-sm overflow-hidden relative transition-all duration-300 cursor-pointer",
                                    statusBorder,
                                    isExpanded ? "bg-white shadow-lg scale-[1.01] ring-1 ring-gray-200" : "bg-white hover:shadow-md"
                                )}
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className={cn("font-bold text-xl text-gray-900 tracking-tight mb-1", outfit.className)}>
                                                {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
                                            </h3>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-md">
                                                    <div className="h-1.5 w-16 bg-gray-200 rounded-full overflow-hidden">
                                                        <div className="h-full bg-black rounded-full" style={{ width: `${progress}%` }} />
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-600">{Math.round(progress)}%</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-1 flex-wrap max-w-[80px] justify-end content-start">
                                            {day.tasks && day.tasks.slice(0, 8).map((t: any) => (
                                                <div key={t.id} className={cn("w-1.5 h-1.5 rounded-full", t.completed ? (PRIORITY_COLORS[t.priority as 0 | 1 | 2] || 'bg-green-500') : "bg-gray-200")} />
                                            ))}
                                        </div>
                                    </div>

                                    {!isExpanded ? (
                                        <p className="text-gray-400 text-sm font-medium truncate opacity-70">{day.note || "No reflection."}</p>
                                    ) : (
                                        <div className="animate-in fade-in duration-500 pt-6 border-t border-gray-100 mt-6">
                                            {/* Reflection & Intent */}
                                            <div className="grid md:grid-cols-2 gap-4 mb-6">
                                                {day.note && (
                                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Reflection</h4>
                                                        <p className="text-gray-800 text-sm whitespace-pre-wrap">{day.note}</p>
                                                    </div>
                                                )}
                                                {day.tomorrow_intent && (
                                                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                                        <h4 className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">Tomorrow's Intent</h4>
                                                        <p className="text-blue-900 text-sm whitespace-pre-wrap">{day.tomorrow_intent}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* 3 Pillars Grid */}
                                            <div className="grid grid-cols-3 gap-3 mb-6">
                                                {/* DSA */}
                                                <div className={cn("p-4 rounded-2xl border flex flex-col gap-2", day.dsa_done ? "bg-purple-50 border-purple-100" : "bg-white border-gray-100 opacity-60")}>
                                                    <div className="flex justify-between items-center">
                                                        <h5 className="font-bold text-sm text-gray-900">DSA</h5>
                                                        {day.dsa_done && <span className="text-[10px] bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded font-bold">DONE</span>}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {day.dsa_time > 0 && <span>⏱ {day.dsa_time}m</span>}
                                                    </div>
                                                    {day.dsa_note && <p className="text-xs text-gray-600 mt-1 italic border-t border-purple-200/50 pt-1">"{day.dsa_note}"</p>}
                                                </div>

                                                {/* Dev */}
                                                <div className={cn("p-4 rounded-2xl border flex flex-col gap-2", day.dev_done ? "bg-amber-50 border-amber-100" : "bg-white border-gray-100 opacity-60")}>
                                                    <div className="flex justify-between items-center">
                                                        <h5 className="font-bold text-sm text-gray-900">Dev</h5>
                                                        {day.dev_done && <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-bold">DONE</span>}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {day.dev_time > 0 && <span>⏱ {day.dev_time}m</span>}
                                                    </div>
                                                    {day.dev_note && <p className="text-xs text-gray-600 mt-1 italic border-t border-amber-200/50 pt-1">"{day.dev_note}"</p>}
                                                </div>

                                                {/* Gym */}
                                                <div className={cn("p-4 rounded-2xl border flex flex-col gap-2", day.gym_done ? "bg-red-50 border-red-100" : "bg-white border-gray-100 opacity-60")}>
                                                    <div className="flex justify-between items-center">
                                                        <h5 className="font-bold text-sm text-gray-900">Gym</h5>
                                                        {day.gym_done && <span className="text-[10px] bg-red-200 text-red-800 px-1.5 py-0.5 rounded font-bold">DONE</span>}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {day.gym_time > 0 && <span>⏱ {day.gym_time}m</span>}
                                                    </div>
                                                    {day.gym_note && <p className="text-xs text-gray-600 mt-1 italic border-t border-red-200/50 pt-1">"{day.gym_note}"</p>}
                                                </div>
                                            </div>

                                            {/* Tasks List */}
                                            <div className="space-y-3">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Detailed Tasks</h4>
                                                {day.tasks && day.tasks.length > 0 ? (
                                                    <div className="grid sm:grid-cols-2 gap-3">
                                                        {day.tasks.map((t: any) => (
                                                            <div key={t.id} className={cn("flex items-start gap-3 p-3 rounded-xl border", t.completed ? "bg-gray-50 border-gray-200" : "bg-white border-gray-100")}>
                                                                <div className={cn("mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0", t.completed ? "bg-black border-black" : "border-gray-300")}>
                                                                    {t.completed && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" /></svg>}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className={cn("text-xs font-bold truncate", t.completed ? "text-gray-500 line-through" : "text-gray-900")}>{t.title}</p>
                                                                    <div className="flex gap-2 mt-1">
                                                                        <span className={cn("text-[8px] font-bold px-1 rounded uppercase border", t.section_title ? "border-gray-200 text-gray-500" : "border-transparent text-gray-300")}>{t.section_title || 'MISC'}</span>
                                                                        {t.estimated_time && <span className="text-[8px] bg-gray-100 text-gray-500 px-1 rounded">⏱ {t.estimated_time}m</span>}
                                                                    </div>
                                                                    {t.note && <p className="text-[10px] text-gray-400 mt-1 truncate">"{t.note}"</p>}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-gray-300 italic pl-1">No tasks logged.</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
