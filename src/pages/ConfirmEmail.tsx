import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

export const ConfirmEmail: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
                <div className="flex justify-center mb-6">
                    <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center">
                        <Mail className="h-8 w-8 text-emerald-600" />
                    </div>
                </div>
                
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Confirme seu Email</h1>
                
                <p className="text-slate-600 mb-8">
                    Cadastro realizado com sucesso! Enviamos um link de confirmação para o seu email. 
                    Por favor, verifique sua caixa de entrada (e spam) para ativar sua conta.
                </p>

                <div className="space-y-4">
                    <Link 
                        to="/carros-baratos?login=true" 
                        className="block w-full bg-[#2ABB9B] hover:bg-[#24a085] text-white font-bold py-3 rounded-lg transition-colors"
                    >
                        Ir para Login
                    </Link>
                    
                    <Link 
                        to="/" 
                        className="block w-full text-slate-500 hover:text-slate-700 font-medium text-sm"
                    >
                        Voltar para Home
                    </Link>
                </div>
            </div>
        </div>
    );
};
