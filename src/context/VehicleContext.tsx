import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import { type Vehicle } from '../data';
import { vehicleService } from '../services/vehicleService';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface VehicleContextType {
    vehicles: Vehicle[];
    loading: boolean;
    addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<void>;
    updateVehicle: (vehicle: Vehicle) => Promise<void>;
    deleteVehicle: (id: number) => Promise<void>;
    getVehicle: (id: number) => Vehicle | undefined;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export const VehicleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);

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
                    console.log('Real-time event received:', payload);

                    if (payload.eventType === 'INSERT') {
                        const newVehicle = payload.new as any;
                        if (newVehicle.status === 'pending') {
                            toast.info('Novo veículo recebido!', {
                                description: `${newVehicle.make} ${newVehicle.model} aguardando aprovação`,
                                duration: 5000,
                            });
                        }
                    }

                    // Always refresh state on any change to keep dashboard synced
                    refreshVehicles();
                }
            )
            .subscribe((status) => {
                console.log('Real-time subscription status:', status);
            });

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

    return (
        <VehicleContext.Provider value={{ vehicles, loading, addVehicle, updateVehicle, deleteVehicle, getVehicle }}>
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
