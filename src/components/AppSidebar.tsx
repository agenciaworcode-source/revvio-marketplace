import { useNavigate, NavLink } from 'react-router-dom';
import { Users, LogOut, LayoutDashboard, Eye } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from '../lib/supabase';
import { NotificationBell } from './NotificationBell';

export const AppSidebar: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <aside className="w-64 min-h-screen bg-slate-950 text-slate-50 flex flex-col border-r border-slate-800">
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <img src="/assets/logo-icon.png" alt="Logo" className="h-8 w-auto" />
                    <div className="flex items-center font-bold text-2xl tracking-tighter">
                        <span className="text-white">REV</span>
                        <span className="text-emerald-500">VIO</span>
                    </div>
                </div>
                <NotificationBell />
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Menu</p>

                <NavLink
                    to="/dashboard"
                    end
                    className={({ isActive }) => cn(
                        "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors",
                        isActive
                            ? "bg-slate-800 text-white shadow-sm ring-1 ring-slate-700"
                            : "text-slate-400 hover:text-white hover:bg-slate-900"
                    )}
                >
                    <LayoutDashboard className="w-5 h-5" />
                    Visão Geral
                </NavLink>

                <NavLink
                    to="/dashboard/owners"
                    className={({ isActive }) => cn(
                        "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors",
                        isActive
                            ? "bg-slate-800 text-white shadow-sm ring-1 ring-slate-700"
                            : "text-slate-400 hover:text-white hover:bg-slate-900"
                    )}
                >
                    <Users className="w-5 h-5" />
                    Proprietários
                </NavLink>

                <NavLink
                    to="/"
                    className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
                >
                    <Eye className="w-5 h-5" />
                    Ver Marketplace
                </NavLink>
            </nav>

            <div className="p-4">
                <div className="h-px bg-slate-800 my-4" />
                <Button
                    variant="ghost"
                    className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-900 gap-3"
                    onClick={handleLogout}
                >
                    <LogOut className="w-5 h-5" />
                    Sair
                </Button>
            </div>
        </aside>
    );
};
