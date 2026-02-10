import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


export const Header: React.FC = () => {
    const { user, signOut } = useAuth();
    return (
        <header className="bg-black text-white h-[60px] flex items-center sticky top-0 z-[1000] shadow-sm">
            <div className="w-full max-w-[1200px] mx-auto px-4 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 no-underline group">
                    <img src="/assets/logo-icon.png" alt="Logo" className="h-8 w-auto group-hover:opacity-90 transition-opacity" />
                    <div className="font-[800] text-2xl tracking-tighter">
                        <span className="text-white">REV</span>
                        <span className="text-[#2ABB9B]">VIO</span>
                    </div>
                </Link>
                <div className="flex items-center gap-4">
                    {user && !window.location.pathname.startsWith('/dashboard') && (
                        <button 
                            onClick={signOut}
                            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                        >
                            Sair
                        </button>
                    )}

                    {!window.location.pathname.startsWith('/dashboard') && (
                        window.location.pathname === '/carros-baratos' ? (
                            <Link to="/" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold text-sm transition-colors no-underline">
                                🏠 Voltar para o Início
                            </Link>
                        ) : (
                            <Link to="/carros-baratos" className="px-4 py-2 bg-[#2ABB9B] hover:bg-[#24a085] text-white rounded font-bold text-sm transition-colors no-underline">
                                🔥 Abaixo da FIPE
                            </Link>
                        )
                    )}
                    {window.location.pathname.startsWith('/dashboard') && (
                        <span className="font-bold text-base text-white">Gestão de Veículos</span>
                    )}
                </div>
            </div>
        </header>
    );
};

