import { supabase } from '../lib/supabase';
import { type Vehicle } from '../data';

// Helper to map DB row to Vehicle type
const mapToVehicle = (row: any): Vehicle => ({
    id: row.id,
    make: row.make,
    model: row.model,
    version: row.version,
    yearModel: row.year_model,
    mileage: row.mileage,
    price: row.price,
    oldPrice: row.old_price,
    isArmored: row.is_armored,
    images: row.images || (row.image ? [row.image] : []),
    location: row.location,
    status: row.status,
    color: row.color,
    fuel: row.fuel,
    transmission: row.transmission,
    plate: row.plate,
    options: row.options || [],
    description: row.description,
    owner: row.owner_name ? {
        name: row.owner_name,
        phone: row.owner_phone,
        email: row.owner_email
    } : undefined
});

// Helper to map Vehicle (or partial) to DB row
const mapToRow = (vehicle: Partial<Vehicle>) => {
    const row: any = {
        make: vehicle.make,
        model: vehicle.model,
        version: vehicle.version,
        year_model: vehicle.yearModel,
        mileage: vehicle.mileage,
        price: vehicle.price,
        old_price: vehicle.oldPrice,
        is_armored: vehicle.isArmored,
        images: vehicle.images,
        location: vehicle.location,
        status: vehicle.status,
        color: vehicle.color,
        fuel: vehicle.fuel,
        transmission: vehicle.transmission,
        plate: vehicle.plate,
        options: vehicle.options,
        description: vehicle.description,
    };

    if (vehicle.owner) {
        row.owner_name = vehicle.owner.name;
        row.owner_phone = vehicle.owner.phone;
        row.owner_email = vehicle.owner.email;
    }

    // Remove undefined keys
    Object.keys(row).forEach(key => row[key] === undefined && delete row[key]);

    return row;
};

export const vehicleService = {
    async getAll() {
        const { data, error } = await supabase
            .from('vehicles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(mapToVehicle);
    },

    async getById(id: number | string) {
        const { data, error } = await supabase
            .from('vehicles')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return mapToVehicle(data);
    },

    async create(vehicle: Omit<Vehicle, 'id'>) {
        const row = mapToRow(vehicle);
        const { data, error } = await supabase
            .from('vehicles')
            .insert(row)
            .select()
            .single();

        if (error) throw error;
        return mapToVehicle(data);
    },

    async update(id: number | string, vehicle: Partial<Vehicle>) {
        const row = mapToRow(vehicle);
        const { data, error } = await supabase
            .from('vehicles')
            .update(row)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return mapToVehicle(data);
    },

    async uploadImages(files: File[]): Promise<string[]> {
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

    async delete(id: number | string) {
        const { error } = await supabase
            .from('vehicles')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async submitFromLP(vehicleData: Omit<Vehicle, 'id' | 'status'>) {
        const row = mapToRow({
            ...vehicleData,
            status: 'pending'
        });

        const { data, error } = await supabase
            .from('vehicles')
            .insert(row)
            .select()
            .single();

        if (error) throw error;
        return mapToVehicle(data);
    },

    async sendLeadToWebhook(leadData: {
        name: string;
        phone: string;
        email: string;
        message: string;
        vehicleName: string;
        simulateFinancing: boolean;
    }) {
        const WEBHOOK_URL = 'https://n8n.agenciaworcode.com.br/webhook/revvio-saas';

        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...leadData,
                timestamp: new Date().toISOString(),
                source: 'Vehicle Details Page'
            }),
        });

        if (!response.ok) {
            throw new Error('Falha ao enviar lead para o servidor');
        }

        return true;
    },

    async batchUpdateOwner(ownerName: string, ownerPhone: string, newOwnerData: { name: string, phone: string, email: string }) {
        const { error } = await supabase
            .from('vehicles')
            .update({
                owner_name: newOwnerData.name,
                owner_phone: newOwnerData.phone,
                owner_email: newOwnerData.email
            })
            .eq('owner_name', ownerName)
            .eq('owner_phone', ownerPhone);

        if (error) throw error;
    },

    async batchDeleteByOwner(ownerName: string, ownerPhone: string) {
        const { error } = await supabase
            .from('vehicles')
            .delete()
            .eq('owner_name', ownerName)
            .eq('owner_phone', ownerPhone);

        if (error) throw error;
    }
};
