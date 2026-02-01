
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
        <div className={cn("min-h-screen bg-[#F0F4F8] dark:bg-gray-950 pb-24 md:pb-0 selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-900 dark:selection:text-blue-100 transition-colors duration-500 ease-out", inter.className)}>
            <div className="flex min-h-screen max-w-[1600px] mx-auto">
                {/* Desktop Sidebar (Hidden on Mobile) */}
                <aside className="hidden md:flex flex-col w-[280px] fixed h-full z-20 p-6">
                    <div className="bg-white dark:bg-gray-900 h-[calc(100vh-48px)] rounded-[2rem] shadow-sm border border-white/50 dark:border-gray-800 p-6 flex flex-col transition-colors duration-300">
                        <h1 className={cn("text-2xl font-bold tracking-tight mb-10 pl-2 text-gray-800 dark:text-white flex items-center gap-2", outfit.className)}>
                            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </div>
                            Execution
                        </h1>

                        <nav className="space-y-2 flex-1">
                            <Link href="/today" className={cn(
                                "group flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium transition-all duration-300 relative overflow-hidden",
                                pathname.includes('today') ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                            )}>
                                <svg className={cn("w-6 h-6 transition-colors", pathname.includes('today') ? "text-blue-600 dark:text-blue-400" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300")} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Today
                            </Link>
                            <Link href="/history" className={cn(
                                "group flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium transition-all duration-300 relative overflow-hidden",
                                pathname.includes('history') ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                            )}>
                                <svg className={cn("w-6 h-6 transition-colors", pathname.includes('history') ? "text-blue-600 dark:text-blue-400" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300")} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                                History
                            </Link>
                        </nav>

                        <div className="mt-auto pt-6 border-t border-transparent">
                            {/* Profile block removed as it is now in the Header */}
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 md:ml-[280px] w-full p-6 md:p-8 overflow-x-hidden">
                    <div className="max-w-[2000px] mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Nav - Floating Pill Style */}
            <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 md:hidden pointer-events-none">
                <nav className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-white/20 dark:border-gray-800 shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-2 rounded-full flex gap-2 pointer-events-auto scale-100 transition-colors duration-300">
                    <Link href="/today" className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300",
                        pathname.includes('today') ? "bg-black dark:bg-white text-white dark:text-black shadow-lg" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {pathname.includes('today') && <span className="text-sm font-bold">Today</span>}
                    </Link>
                    <Link href="/history" className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300",
                        pathname.includes('history') ? "bg-black dark:bg-white text-white dark:text-black shadow-lg" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                        {pathname.includes('history') && <span className="text-sm font-bold">History</span>}
                    </Link>
                </nav>
            </div>
        </div>
    );
}
