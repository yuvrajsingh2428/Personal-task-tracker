
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        if (res.ok) {
            router.push('/today');
            router.refresh(); // Refresh to update middleware/cookies state if needed
        } else {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
            <div className="w-full max-w-sm">
                <h1 className="text-4xl font-extrabold mb-2 text-gray-900 tracking-tight">Login</h1>
                <p className="text-gray-500 mb-8">Welcome back.</p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Email"
                            className="w-full p-4 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-gray-300 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full p-4 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-gray-300 outline-none transition-all"
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <button
                        type="submit"
                        className="w-full bg-black text-white font-bold p-4 rounded-xl hover:opacity-90 transition-opacity"
                    >
                        Continue
                    </button>
                </form>

                <div className="mt-8 text-center text-xs text-gray-400">
                    Use: user@example.com / password
                </div>
            </div>
        </div>
    );
}
