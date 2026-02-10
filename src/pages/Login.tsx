import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';


export const Login: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (data.session) {
                const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
                if (data.session.user.email === adminEmail) {
                    navigate('/dashboard');
                } else {
                    // Start session but deny access to panel
                    navigate('/'); // Or show error toast
                    // Optionally sign them out immediately if you want strict "Login Page is for Admins only"
                    // await supabase.auth.signOut();
                    // setError('Acesso restrito para administradores.');
                }
            }
        } catch (err: any) {
            setError(err.message || 'Falha no login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-[#121212] text-white">
            <div className="bg-[#1e1e1e] p-8 rounded-lg w-full max-w-[400px] shadow-lg text-center">
                <div className="flex justify-center mb-6">
                    <img src="/assets/logo-full.jpg" alt="Logo" className="h-20 w-auto rounded-lg shadow-lg" />
                </div>
                <h1 className="mb-2 text-[#2ABB9B] text-2xl font-bold">Painel Admin</h1>
                <p className="text-[#aaa] mb-8">Entre com suas credenciais para acessar</p>

                {error && <div className="bg-red-500/10 text-red-500 p-3 rounded mb-6 text-sm">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="mb-6 text-left">
                        <label className="block mb-2 text-sm text-[#ccc]">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@exemplo.com"
                            className="w-full p-3 bg-[#2c2c2c] border border-[#333] rounded text-white text-base focus:outline-none focus:border-[#2ABB9B] transition-colors"
                            required
                        />
                    </div>

                    <div className="mb-6 text-left">
                        <label className="block mb-2 text-sm text-[#ccc]">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********"
                            className="w-full p-3 bg-[#2c2c2c] border border-[#333] rounded text-white text-base focus:outline-none focus:border-[#2ABB9B] transition-colors"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full p-3 bg-[#2ABB9B] text-white border-none rounded text-base font-bold cursor-pointer transition-colors hover:bg-[#24a085] disabled:opacity-70 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
};
