"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Outfit } from 'next/font/google';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';

const outfit = Outfit({ subsets: ['latin'] });

export default function SignupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        if (password.length < 8) {
            toast.error('Password must be at least 8 characters long');
            setLoading(false);
            return;
        }
        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                body: JSON.stringify({ name, email, password }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Signup failed');

            toast.success('Account created!');
            router.push('/today');
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cn("min-h-screen flex items-center justify-center bg-[#F0F4F8] p-4", outfit.className)}>
            <div className="bg-white rounded-[2rem] p-8 md:p-12 w-full max-w-md shadow-2xl border border-white/50 relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                    <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" /></svg>
                </div>

                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Join</h1>
                    <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mb-8">Start your execution</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full p-4 rounded-xl bg-gray-50 text-base font-bold text-gray-900 outline-none focus:ring-2 focus:ring-black/5 border border-gray-100 transition-all"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full p-4 rounded-xl bg-gray-50 text-base font-bold text-gray-900 outline-none focus:ring-2 focus:ring-black/5 border border-gray-100 transition-all"
                                placeholder="name@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full p-4 rounded-xl bg-gray-50 text-base font-bold text-gray-900 outline-none focus:ring-2 focus:ring-black/5 border border-gray-100 transition-all"
                                placeholder="Min. 8 characters"
                                minLength={8}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white font-bold py-4 rounded-xl text-lg hover:shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-400 text-sm font-medium">
                            Already have an account?{' '}
                            <Link href="/login" className="text-black font-bold hover:underline">
                                Log In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
