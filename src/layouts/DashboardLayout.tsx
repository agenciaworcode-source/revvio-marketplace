import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AppSidebar } from '../components/AppSidebar';
import { supabase } from '../lib/supabase';


export const DashboardLayout: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/login');
                return;
            }

            // Check if user is admin via Email (Simple & Effective for single-tenant)
            const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
            
            if (session.user.email !== adminEmail) {
                // Not the admin, redirect to home
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
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
            <AppSidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Optional Topbar can go here */}
                <main className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
