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
                            className="text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer bg-red-500 px-2 py-1 rounded-md"
                        >
                            Sair
                        </button>
                    )}


                    {window.location.pathname.startsWith('/dashboard') && (
                        <span className="font-bold text-base text-white">Gestão de Veículos</span>
                    )}
                </div>
            </div>
        </header>
    );
};

