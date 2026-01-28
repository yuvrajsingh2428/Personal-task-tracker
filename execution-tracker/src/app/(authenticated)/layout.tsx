
"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Inter, Outfit } from 'next/font/google';

// Use Outfit for headings (modern, geometric like Google Sans)
const outfit = Outfit({ subsets: ['latin'] });
// Use Inter for body (clean, readable like Roboto/Product Sans)
const inter = Inter({ subsets: ['latin'] });

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className={cn("min-h-screen bg-[#F0F4F8] pb-24 md:pb-0 selection:bg-blue-100 selection:text-blue-900", inter.className)}>
            <div className="flex min-h-screen max-w-[1600px] mx-auto">
                {/* Desktop Sidebar (Hidden on Mobile) */}
                <aside className="hidden md:flex flex-col w-[280px] fixed h-full z-20 p-6">
                    <div className="bg-white h-[calc(100vh-48px)] rounded-[2rem] shadow-sm border border-white/50 p-6 flex flex-col">
                        <h1 className={cn("text-2xl font-bold tracking-tight mb-10 pl-2 text-gray-800 flex items-center gap-2", outfit.className)}>
                            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </div>
                            Execution
                        </h1>

                        <nav className="space-y-2 flex-1">
                            <Link href="/today" className={cn(
                                "group flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium transition-all duration-300 relative overflow-hidden",
                                pathname.includes('today') ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            )}>
                                <svg className={cn("w-6 h-6 transition-colors", pathname.includes('today') ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600")} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Today
                            </Link>
                            <Link href="/history" className={cn(
                                "group flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium transition-all duration-300 relative overflow-hidden",
                                pathname.includes('history') ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            )}>
                                <svg className={cn("w-6 h-6 transition-colors", pathname.includes('history') ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600")} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                                History
                            </Link>
                        </nav>

                        <div className="mt-auto pt-6 border-t border-gray-100">
                            <div className="flex items-center gap-3 px-2">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                    U
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate">User</p>
                                    <p className="text-xs text-gray-400 truncate">user@example.com</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 md:ml-[280px] w-full p-6 md:p-8 overflow-x-hidden">
                    <div className="max-w-5xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Nav - Floating Pill Style */}
            <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 md:hidden pointer-events-none">
                <nav className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-2 rounded-full flex gap-2 pointer-events-auto scale-100">
                    <Link href="/today" className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300",
                        pathname.includes('today') ? "bg-black text-white shadow-lg" : "text-gray-500 hover:bg-gray-100"
                    )}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {pathname.includes('today') && <span className="text-sm font-bold">Today</span>}
                    </Link>
                    <Link href="/history" className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300",
                        pathname.includes('history') ? "bg-black text-white shadow-lg" : "text-gray-500 hover:bg-gray-100"
                    )}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                        {pathname.includes('history') && <span className="text-sm font-bold">History</span>}
                    </Link>
                </nav>
            </div>
        </div>
    );
}
