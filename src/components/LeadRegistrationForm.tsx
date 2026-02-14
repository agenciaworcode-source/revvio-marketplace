import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export const LeadRegistrationForm: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isLogin, setIsLogin] = useState(searchParams.get('login') === 'true');
    const [formData, setFormData] = useState({
        nome: '',
        contato: '',
        email: '',
        senha: '',
        cidade: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                // Login Flow
                const { error } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.senha,
                });
                if (error) throw error;
                toast.success("Login realizado com sucesso!");
                // O AuthContext detectará a mudança e atualizará a tela automaticamente
            } else {
                // Registration Flow
                // 1. Sign Up
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.senha,
                    options: {
                        emailRedirectTo: `${window.location.origin}/dashboard`,
                        data: {
                            nome: formData.nome,
                            contato: formData.contato,
                            cidade: formData.cidade
                        }
                    }
                });

                if (authError) throw authError;

                if (authData.user) {
                    // Lead inserted via Database Trigger automatically
                    toast.success("Cadastro realizado! Aproveite as ofertas.");
                    navigate('/confirm-email');
                } else if (authData.session === null) {
                    // Caso o Supabase exija confirmação de email
                    toast.info("Verifique seu email para confirmar o cadastro.");
                    navigate('/confirm-email');
                }
            }
        } catch (error: any) {
             console.error(error);
             if (error.message.includes("User already registered")) {
                 toast.error("Este email já está cadastrado. Por favor, faça login.");
                 setIsLogin(true);
             } else if (error.message.includes("Invalid login credentials")) {
                toast.error("Email ou senha incorretos.");
             } else {
                toast.error(error.message || 'Erro ao processar solicitação');
             }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-slate-50/50 backdrop-blur-sm px-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm border border-slate-100">
                <div className="flex justify-center mb-6 border-b border-slate-100 pb-2">
                    <button
                        className={`flex-1 pb-2 font-semibold text-xs uppercase tracking-wider transition-colors ${!isLogin ? 'text-[#2ABB9B] border-b-2 border-[#2ABB9B]' : 'text-slate-400 hover:text-slate-600'}`}
                        onClick={() => setIsLogin(false)}
                    >
                        Criar Conta
                    </button>
                    <button
                        className={`flex-1 pb-2 font-semibold text-xs uppercase tracking-wider transition-colors ${isLogin ? 'text-[#2ABB9B] border-b-2 border-[#2ABB9B]' : 'text-slate-400 hover:text-slate-600'}`}
                        onClick={() => setIsLogin(true)}
                    >
                        Entrar
                    </button>
                </div>

                <div className="text-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800">
                        {isLogin ? 'Bem-vindo' : 'Acesso VIP'}
                    </h2>
                    <p className="text-slate-400 text-xs mt-1">
                        {isLogin 
                         ? 'Entre para ver as ofertas.' 
                         : 'Cadastre-se para ver ofertas abaixo da FIPE.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    {!isLogin && (
                        <>
                            <div>
                                <input
                                    type="text"
                                    name="nome"
                                    placeholder="Nome Completo"
                                    value={formData.nome}
                                    onChange={handleChange}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-[#2ABB9B] focus:border-[#2ABB9B] outline-none"
                                    required={!isLogin}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    name="contato"
                                    placeholder="WhatsApp"
                                    value={formData.contato}
                                    onChange={handleChange}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-[#2ABB9B] focus:border-[#2ABB9B] outline-none"
                                    required={!isLogin}
                                />
                                <input
                                    type="text"
                                    name="cidade"
                                    placeholder="Cidade"
                                    value={formData.cidade}
                                    onChange={handleChange}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-[#2ABB9B] focus:border-[#2ABB9B] outline-none"
                                    required={!isLogin}
                                />
                            </div>
                        </>
                    )}
                    
                    <div>
                        <input
                            type="email"
                            name="email"
                            placeholder="Seu melhor email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-[#2ABB9B] focus:border-[#2ABB9B] outline-none"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            name="senha"
                            placeholder="Senha segura"
                            value={formData.senha}
                            onChange={handleChange}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-[#2ABB9B] focus:border-[#2ABB9B] outline-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#2ABB9B] hover:bg-[#24a085] text-white font-bold py-2.5 rounded-lg transition-all shadow-md mt-2 text-sm"
                    >
                        {loading ? 'Carregando...' : (isLogin ? 'Acessar Ofertas' : 'Ver Ofertas Abaixo da FIPE')}
                    </button>
                </form>
            </div>
        </div>
    );
};
