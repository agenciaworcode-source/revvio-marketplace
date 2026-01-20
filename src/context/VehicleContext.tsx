import React, { createContext, useState, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { type Vehicle } from '../data';
import { vehicleService } from '../services/vehicleService';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export interface Notification {
    id: string;
    title: string;
    description: string;
    timestamp: Date;
    read: boolean;
    vehicleId?: number;
}

interface VehicleContextType {
    vehicles: Vehicle[];
    loading: boolean;
    notifications: Notification[];
    unreadCount: number;
    addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<void>;
    updateVehicle: (vehicle: Vehicle) => Promise<void>;
    deleteVehicle: (id: number) => Promise<void>;
    getVehicle: (id: number) => Vehicle | undefined;
    markNotificationsAsRead: () => void;
    clearNotifications: () => void;
    updateOwner: (oldName: string, oldPhone: string, newData: { name: string, phone: string, email: string }) => Promise<void>;
    deleteOwner: (name: string, phone: string) => Promise<void>;
    owners: Array<{ name: string, phone: string, email: string }>;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export const VehicleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const refreshVehicles = async () => {
        try {
            const data = await vehicleService.getAll();
            setVehicles(data);
        } catch (error) {
            console.error('Failed to fetch vehicles:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshVehicles();

        // Real-time subscription for vehicles updates
        const subscription = supabase
            .channel('vehicles_realtime')
            .on('postgres_changes',
                {
                    event: '*', // Listen for ALL events (INSERT, UPDATE, DELETE)
                    schema: 'public',
                    table: 'vehicles'
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const newVehicle = payload.new as any;
                        const isDashboard = window.location.pathname.startsWith('/dashboard');

                        if (newVehicle.status === 'pending') {
                            const newNotification: Notification = {
                                id: Math.random().toString(36).substr(2, 9),
                                title: 'Novo veículo recebido!',
                                description: `${newVehicle.make} ${newVehicle.model} aguardando aprovação`,
                                timestamp: new Date(),
                                read: false,
                                vehicleId: newVehicle.id
                            };

                            setNotifications(prev => [newNotification, ...prev]);

                            if (isDashboard) {
                                toast.info(newNotification.title, {
                                    description: newNotification.description,
                                    duration: 5000,
                                });
                            }
                        }
                    }

                    // Always refresh state on any change to keep dashboard synced
                    refreshVehicles();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    const addVehicle = async (vehicle: Omit<Vehicle, 'id'>) => {
        try {
            await vehicleService.create(vehicle);
            await refreshVehicles();
        } catch (error) {
            console.error('Failed to create vehicle:', error);
            throw error;
        }
    };

    const updateVehicle = async (updatedVehicle: Vehicle) => {
        try {
            await vehicleService.update(updatedVehicle.id, updatedVehicle);
            await refreshVehicles();
        } catch (error) {
            console.error('Failed to update vehicle:', error);
            throw error;
        }
    };

    const deleteVehicle = async (id: number) => {
        try {
            await vehicleService.delete(id);
            await refreshVehicles();
        } catch (error) {
            console.error('Failed to delete vehicle:', error);
            throw error;
        }
    };

    const getVehicle = (id: number) => {
        return vehicles.find(v => v.id === id);
    };

    const updateOwner = async (oldName: string, oldPhone: string, newData: { name: string, phone: string, email: string }) => {
        try {
            await vehicleService.batchUpdateOwner(oldName, oldPhone, newData);
            await refreshVehicles();
            toast.success('Proprietário atualizado com sucesso!');
        } catch (error) {
            console.error('Failed to update owner:', error);
            toast.error('Erro ao atualizar proprietário.');
            throw error;
        }
    };

    const deleteOwner = async (name: string, phone: string) => {
        try {
            await vehicleService.batchDeleteByOwner(name, phone);
            await refreshVehicles();
            toast.success('Proprietário e seus veículos excluídos com sucesso!');
        } catch (error) {
            console.error('Failed to delete owner:', error);
            toast.error('Erro ao excluir proprietário.');
            throw error;
        }
    };

    const markNotificationsAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const owners = useMemo(() => {
        const ownerMap = new Map<string, { name: string, phone: string, email: string }>();
        vehicles.forEach(vehicle => {
            if (vehicle.owner && vehicle.owner.name) {
                const key = `${vehicle.owner.name.trim().toLowerCase()}-${vehicle.owner.phone ? vehicle.owner.phone.replace(/\D/g, '') : 'nophone'}`;
                if (!ownerMap.has(key)) {
                    ownerMap.set(key, {
                        name: vehicle.owner.name,
                        phone: vehicle.owner.phone || '',
                        email: vehicle.owner.email || ''
                    });
                }
            }
        });
        return Array.from(ownerMap.values());
    }, [vehicles]);

    return (
        <VehicleContext.Provider value={{
            vehicles,
            loading,
            notifications,
            unreadCount,
            addVehicle,
            updateVehicle,
            deleteVehicle,
            getVehicle,
            markNotificationsAsRead,
            clearNotifications,
            updateOwner,
            deleteOwner,
            owners
        }}>
            {children}
        </VehicleContext.Provider>
    );
};

export const useVehicles = () => {
    const context = useContext(VehicleContext);
    if (context === undefined) {
        throw new Error('useVehicles must be used within a VehicleProvider');
    }
    return context;
};
