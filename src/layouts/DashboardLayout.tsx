import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AppSidebar } from '../components/AppSidebar';
import { supabase } from '../lib/supabase';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';

export const DashboardLayout: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/login');
                return;
            }

            const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
            
            if (session.user.email !== adminEmail) {
                navigate('/');
            }
            
            setLoading(false);
        };

        checkAuth();
    }, [navigate]);

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-slate-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden text-slate-900 dark:text-slate-100">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-64 h-full shrink-0">
                <AppSidebar />
            </div>

            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="lg:hidden flex items-center justify-between p-4 bg-slate-950 text-white border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <img src="/assets/logo-icon.png" alt="Logo" className="h-8 w-auto" />
                        <div className="flex items-center font-bold text-xl tracking-tighter">
                            <span className="text-white">REV</span>
                            <span className="text-emerald-500">VIO</span>
                        </div>
                    </div>
                    
                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-slate-900">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-72 bg-slate-950 border-slate-800">
                            <div onClick={() => setIsMobileMenuOpen(false)} className="h-full">
                                <AppSidebar />
                            </div>
                        </SheetContent>
                    </Sheet>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
