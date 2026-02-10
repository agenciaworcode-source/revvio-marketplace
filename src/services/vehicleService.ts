import { supabase } from '../lib/supabase';
import { type Vehicle } from '../data';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const vehicleService = {
    async getAll(): Promise<Vehicle[]> {
        const response = await fetch(`${API_URL}/vehicles`);
        if (!response.ok) throw new Error('Falha ao buscar veículos');
        return response.json();
    },

    async getById(id: number | string): Promise<Vehicle> {
        const response = await fetch(`${API_URL}/vehicles/${id}`);
        if (!response.ok) throw new Error('Veículo não encontrado');
        return response.json();
    },

    async create(vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(`${API_URL}/vehicles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify(vehicle)
        });
        if (!response.ok) throw new Error('Erro ao criar veículo');
        return response.json();
    },

    async update(id: number | string, vehicle: Partial<Vehicle>): Promise<Vehicle> {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(`${API_URL}/vehicles/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify(vehicle)
        });
        if (!response.ok) throw new Error('Erro ao atualizar veículo');
        return response.json();
    },

    async uploadImages(files: File[]): Promise<string[]> {
        // Mantemos upload direto no Supabase Storage via FE por simplicidade no momento
        const uploadPromises = files.map(async (file) => {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;
            const { error: uploadError } = await supabase.storage
                .from('vehicles')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('vehicles')
                .getPublicUrl(filePath);

            return data.publicUrl;
        });

        return Promise.all(uploadPromises);
    },

    async delete(id: number | string): Promise<void> {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(`${API_URL}/vehicles/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${session?.access_token}`
            }
        });
        if (!response.ok) throw new Error('Erro ao excluir veículo');
    },

    async submitFromLP(vehicleData: Omit<Vehicle, 'id' | 'status'>): Promise<Vehicle> {
        // Envia como pending via API
        const response = await fetch(`${API_URL}/vehicles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...vehicleData, status: 'pending' })
        });
        if (!response.ok) throw new Error('Erro ao cadastrar veículo via Landing Page');
        return response.json();
    },

    async sendLeadToWebhook(leadData: any) {
        const response = await fetch(`${API_URL}/leads`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...leadData,
                timestamp: new Date().toISOString(),
                source: 'Vehicle Details Page'
            })
        });

        if (!response.ok) throw new Error('Falha ao enviar lead');
        return true;
    },

    async batchUpdateOwner(oldName: string, oldPhone: string, newOwnerData: { name: string, phone: string, email: string }) {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(`${API_URL}/owners`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify({ oldName, oldPhone, newData: newOwnerData })
        });
        if (!response.ok) throw new Error('Erro ao atualizar proprietário em lote');
    },

    async batchDeleteByOwner(ownerName: string, ownerPhone: string) {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(`${API_URL}/owners`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify({ name: ownerName, phone: ownerPhone })
        });
        if (!response.ok) throw new Error('Erro ao excluir proprietário e seus veículos');
    }
};
