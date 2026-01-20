import React from 'react';
import { Bell, Trash2, CheckCircle } from 'lucide-react';
import { useVehicles } from '../context/VehicleContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const NotificationBell: React.FC = () => {
    const { notifications, unreadCount, markNotificationsAsRead, clearNotifications } = useVehicles();

    return (
        <DropdownMenu onOpenChange={(open) => open && markNotificationsAsRead()}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white hover:bg-slate-900">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white border-2 border-slate-950">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-slate-900 border-slate-800 text-slate-100 p-0">
                <div className="flex items-center justify-between p-4 bg-slate-950/50">
                    <DropdownMenuLabel className="font-bold text-base p-0">Notificações</DropdownMenuLabel>
                    {notifications.length > 0 && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-400/10"
                            onClick={(e) => {
                                e.stopPropagation();
                                clearNotifications();
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                <DropdownMenuSeparator className="bg-slate-800 m-0" />
                <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={cn(
                                    "flex flex-col items-start gap-1 p-4 focus:bg-slate-800 cursor-default",
                                    !notification.read && "bg-emerald-500/5"
                                )}
                            >
                                <div className="flex items-center gap-2 w-full">
                                    <span className="font-semibold text-sm">{notification.title}</span>
                                    {!notification.read && (
                                        <span className="h-2 w-2 rounded-full bg-emerald-500 ml-auto" />
                                    )}
                                </div>
                                <p className="text-xs text-slate-400 line-clamp-2">{notification.description}</p>
                                <span className="text-[10px] text-slate-500 mt-1 uppercase font-medium">
                                    {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </DropdownMenuItem>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
                            <CheckCircle className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm">Nenhuma notificação</p>
                        </div>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
