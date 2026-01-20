import React, { useMemo, useState } from 'react';
import { useVehicles } from '../context/VehicleContext';
import { type Vehicle } from '../data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Users,
    Phone,
    Mail,
    Car,
    Eye,
    TrendingUp,
    Edit,
    Trash2,
    Save,
    X
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

interface OwnerGroup {
    id: string;
    name: string;
    phone: string;
    email: string;
    vehicles: Vehicle[];
}

export const Owners: React.FC = () => {
    const { vehicles, loading, updateOwner, deleteOwner } = useVehicles();
    const [selectedOwner, setSelectedOwner] = useState<OwnerGroup | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: '',
        phone: '',
        email: ''
    });

    const owners = useMemo(() => {
        const ownerMap = new Map<string, OwnerGroup>();

        vehicles.forEach(vehicle => {
            if (vehicle.owner && vehicle.owner.name) {
                const key = `${vehicle.owner.name.trim().toLowerCase()}-${vehicle.owner.phone ? vehicle.owner.phone.replace(/\D/g, '') : 'nophone'}`;

                if (!ownerMap.has(key)) {
                    ownerMap.set(key, {
                        id: key,
                        name: vehicle.owner.name,
                        phone: vehicle.owner.phone || 'N/A',
                        email: vehicle.owner.email || 'N/A',
                        vehicles: []
                    });
                }

                ownerMap.get(key)?.vehicles.push(vehicle);
            }
        });

        return Array.from(ownerMap.values());
    }, [vehicles]);

    const stats = {
        totalOwners: owners.length,
        totalLinkedVehicles: owners.reduce((acc, curr) => acc + curr.vehicles.length, 0),
        avgVehiclesPerOwner: owners.length ? (owners.reduce((acc, curr) => acc + curr.vehicles.length, 0) / owners.length).toFixed(1) : 0
    };

    const handleEditClick = (owner: OwnerGroup) => {
        setEditFormData({
            name: owner.name,
            phone: owner.phone,
            email: owner.email === 'N/A' ? '' : owner.email
        });
        setSelectedOwner(owner);
        setIsEditing(true);
    };

    const handleDeleteClick = async (owner: OwnerGroup) => {
        if (window.confirm(`Tem certeza que deseja excluir o proprietário "${owner.name}"? Isso também excluirá todos os ${owner.vehicles.length} veículos vinculados a ele.`)) {
            try {
                await deleteOwner(owner.name, owner.phone);
            } catch (error) {
                // Error handled in context
            }
        }
    };

    const handleSaveEdit = async () => {
        if (!selectedOwner) return;

        if (!editFormData.name || !editFormData.phone) {
            toast.error('Nome e telefone são obrigatórios.');
            return;
        }

        try {
            await updateOwner(selectedOwner.name, selectedOwner.phone, editFormData);
            setIsEditing(false);
            setSelectedOwner(null);
        } catch (error) {
            // Error handled in context
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Gestão de Proprietários</h1>
                <p className="text-muted-foreground mt-1">Visualize e gerencie os proprietários e seus veículos vinculados</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Proprietários</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalOwners}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Veículos Vinculados</CardTitle>
                        <Car className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalLinkedVehicles}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Média por Proprietário</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.avgVehiclesPerOwner}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Owners Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Proprietários</CardTitle>
                    <CardDescription>Lista completa de proprietários cadastrados</CardDescription>
                </CardHeader>
                <CardContent>
                    {owners.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Users className="w-12 h-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Nenhum proprietário encontrado</h3>
                            <p className="text-sm text-muted-foreground text-center max-w-md">
                                Os proprietários são cadastrados automaticamente ao criar um veículo com dados de proprietário.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {owners.map(owner => (
                                <div
                                    key={owner.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarFallback className="bg-emerald-500 text-white font-semibold">
                                                {owner.name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-semibold">{owner.name}</h3>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-muted-foreground mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    {owner.phone}
                                                </span>
                                                {owner.email !== 'N/A' && (
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        {owner.email}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-right hidden lg:block mr-4">
                                            <div className="text-sm font-medium">{owner.vehicles.length} veículo(s)</div>
                                            <div className="text-xs text-muted-foreground">vinculado(s)</div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedOwner(owner);
                                                setIsEditing(false);
                                            }}
                                            className="gap-2"
                                            title="Ver Detalhes"
                                        >
                                            <Eye className="w-4 h-4" />
                                            <span className="hidden sm:inline">Detalhes</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEditClick(owner)}
                                            className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                            title="Editar"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteClick(owner)}
                                            className="gap-2 text-destructive hover:text-destructive hover:bg-red-50"
                                            title="Excluir"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Owner Details or Edit Dialog */}
            <Dialog open={!!selectedOwner} onOpenChange={() => {
                setSelectedOwner(null);
                setIsEditing(false);
            }}>
                <DialogContent className={cn(
                    "max-h-[90vh] overflow-y-auto",
                    !isEditing ? "max-w-4xl" : "max-w-md"
                )}>
                    <DialogHeader>
                        <DialogTitle>
                            {isEditing ? 'Editar Proprietário' : 'Detalhes do Proprietário'}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedOwner && !isEditing && (
                        <div className="space-y-6">
                            {/* Owner Profile */}
                            <div className="flex items-center gap-4 p-4 bg-accent/50 rounded-lg">
                                <Avatar className="h-16 w-16">
                                    <AvatarFallback className="bg-emerald-500 text-white text-2xl font-semibold">
                                        {selectedOwner.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold">{selectedOwner.name}</h3>
                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                                        <span className="flex items-center gap-1">
                                            <Phone className="w-4 h-4" />
                                            {selectedOwner.phone}
                                        </span>
                                        {selectedOwner.email !== 'N/A' && (
                                            <span className="flex items-center gap-1">
                                                <Mail className="w-4 h-4" />
                                                {selectedOwner.email}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => handleEditClick(selectedOwner)}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Editar
                                    </Button>
                                </div>
                            </div>

                            {/* Linked Vehicles */}
                            <div>
                                <h4 className="text-lg font-semibold mb-4">
                                    Veículos Vinculados ({selectedOwner.vehicles.length})
                                </h4>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {selectedOwner.vehicles.map(vehicle => (
                                        <Card key={vehicle.id} className="overflow-hidden">
                                            <div className="aspect-video relative bg-slate-100">
                                                {vehicle.images && vehicle.images.length > 0 ? (
                                                    <img
                                                        src={vehicle.images[0]}
                                                        alt={vehicle.model}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Car className="w-8 h-8 text-slate-300" />
                                                    </div>
                                                )}
                                                <div className="absolute top-2 right-2">
                                                    <Badge
                                                        className={cn(
                                                            vehicle.status === 'sold' && 'bg-slate-500',
                                                            vehicle.status === 'reserved' && 'bg-amber-500',
                                                            (!vehicle.status || vehicle.status === 'active') && 'bg-emerald-500'
                                                        )}
                                                    >
                                                        {vehicle.status === 'sold' ? 'Vendido' :
                                                            vehicle.status === 'reserved' ? 'Reservado' :
                                                                'Ativo'}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <CardHeader className="p-4">
                                                <CardTitle className="text-base">{vehicle.make} {vehicle.model}</CardTitle>
                                                <CardDescription className="text-sm">
                                                    {vehicle.version} • {vehicle.yearModel}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-0">
                                                <div className="text-lg font-bold text-emerald-600">
                                                    R$ {vehicle.price.toLocaleString('pt-BR')}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedOwner && isEditing && (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome Completo</Label>
                                <Input
                                    id="name"
                                    value={editFormData.name}
                                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                    placeholder="Ex: João Silva"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                                <Input
                                    id="phone"
                                    value={editFormData.phone}
                                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                    placeholder="(11) 99999-9999"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail (Opcional)</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={editFormData.email}
                                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                    placeholder="joao@exemplo.com"
                                />
                            </div>
                            <DialogFooter className="pt-4">
                                <Button variant="outline" onClick={() => setIsEditing(false)} className="gap-2">
                                    <X className="w-4 h-4" />
                                    Cancelar
                                </Button>
                                <Button onClick={handleSaveEdit} className="gap-2">
                                    <Save className="w-4 h-4" />
                                    Salvar Alterações
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};
