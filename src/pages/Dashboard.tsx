import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVehicles } from '../context/VehicleContext';
import { type Vehicle } from '../data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Car,
    Plus,
    Search,
    Edit,
    Trash2,
    TrendingUp,
    Clock,
    CheckCircle2,
    XCircle,
    Download
} from 'lucide-react';
import { cn } from "@/lib/utils";

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { vehicles, deleteVehicle, updateVehicle, loading } = useVehicles();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const stats = {
        total: vehicles.length,
        active: vehicles.filter(v => (!v.status || v.status === 'active')).length,
        pending: vehicles.filter(v => v.status === 'pending').length,
        reserved: vehicles.filter(v => v.status === 'reserved').length,
        sold: vehicles.filter(v => v.status === 'sold').length,
    };

    const filteredVehicles = vehicles.filter(vehicle => {
        const matchesSearch = searchTerm === '' ||
            vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleEdit = (vehicle: Vehicle) => {
        navigate(`/dashboard/vehicle/${vehicle.id}/edit`);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este veículo?')) {
            deleteVehicle(id);
        }
    };

    const handleCreate = () => {
        navigate('/dashboard/vehicle/new');
    };

    const handleExportCSV = () => {
        const headers = ['Marca', 'Modelo', 'Versão', 'Ano', 'Preço', 'KM', 'Status'];
        const csvContent = [
            headers.join(';'),
            ...filteredVehicles.map(v => [
                `"${(v.make || '').replace(/"/g, '""')}"`,
                `"${(v.model || '').replace(/"/g, '""')}"`,
                `"${(v.version || '').replace(/"/g, '""')}"`,
                `"${v.yearModel}"`,
                `"${v.price}"`,
                `"${v.mileage}"`,
                `"${v.status}"`
            ].join(';'))
        ].join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `veiculos_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestão de Veículos</h1>
                    <p className="text-muted-foreground mt-1">Gerencie seu inventário de veículos</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleExportCSV} variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Exportar CSV
                    </Button>
                    <Button onClick={handleCreate} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Novo Veículo
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Veículos</CardTitle>
                        <Car className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground mt-1">Inventário completo</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ativos</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.active}</div>
                        <p className="text-xs text-muted-foreground mt-1">Disponíveis para venda</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                        <Clock className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pending}</div>
                        <p className="text-xs text-muted-foreground mt-1">Aguardando aprovação</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Reservados</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.reserved}</div>
                        <p className="text-xs text-muted-foreground mt-1">Em processo de venda</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Vendidos</CardTitle>
                        <TrendingUp className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.sold}</div>
                        <p className="text-xs text-muted-foreground mt-1">Concluídos</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Veículos</CardTitle>
                    <CardDescription>Busque e filtre seu inventário</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por marca ou modelo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="all">Todos os Status</option>
                            <option value="pending">Pendentes</option>
                            <option value="active">Ativos</option>
                            <option value="reserved">Reservados</option>
                            <option value="sold">Vendidos</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Vehicles Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredVehicles.map(vehicle => (
                    <Card key={vehicle.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                        <div className="aspect-[16/9] relative overflow-hidden bg-slate-100">
                            {vehicle.images && vehicle.images.length > 0 ? (
                                <img
                                    src={vehicle.images[0]}
                                    alt={`${vehicle.make} ${vehicle.model}`}
                                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Car className="w-12 h-12 text-slate-300" />
                                </div>
                            )}
                            <div className="absolute top-2 right-2">
                                <Badge
                                    variant={
                                        vehicle.status === 'sold' ? 'secondary' :
                                            vehicle.status === 'reserved' ? 'default' :
                                                'default'
                                    }
                                    className={cn(
                                        vehicle.status === 'sold' && 'bg-slate-500',
                                        vehicle.status === 'reserved' && 'bg-blue-500',
                                        vehicle.status === 'pending' && 'bg-amber-500',
                                        (!vehicle.status || vehicle.status === 'active') && 'bg-emerald-500'
                                    )}
                                >
                                    {vehicle.status === 'sold' ? 'Vendido' :
                                        vehicle.status === 'reserved' ? 'Reservado' :
                                            vehicle.status === 'pending' ? 'Pendente' :
                                                'Ativo'}
                                </Badge>
                            </div>
                        </div>
                        <CardHeader>
                            <CardTitle className="text-lg">{vehicle.make} {vehicle.model}</CardTitle>
                            <CardDescription>{vehicle.version} • {vehicle.yearModel}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-emerald-600">
                                    R$ {((!vehicle.belowFipe && (vehicle.fipePrice || 0) > 0 && vehicle.price === 0) ? (vehicle.fipePrice || 0) : vehicle.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                {vehicle.status === 'pending' ? (
                                    <>
                                        <Button
                                            variant="default"
                                            size="sm"
                                            className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 font-semibold"
                                            onClick={() => updateVehicle({ ...vehicle, status: 'active' })}
                                        >
                                            <CheckCircle2 className="w-3 h-3" />
                                            Aprovar
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="px-2"
                                            title="Editar dados"
                                            onClick={() => handleEdit(vehicle)}
                                        >
                                            <Edit className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="px-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                            title="Reprovar"
                                            onClick={() => handleDelete(vehicle.id)}
                                        >
                                            <XCircle className="w-3 h-3" />
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 gap-2"
                                            onClick={() => handleEdit(vehicle)}
                                        >
                                            <Edit className="w-3 h-3" />
                                            Editar
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                            onClick={() => handleDelete(vehicle.id)}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredVehicles.length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Car className="w-12 h-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Nenhum veículo encontrado</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            {searchTerm ? 'Tente ajustar sua busca' : 'Comece adicionando um novo veículo'}
                        </p>
                        {!searchTerm && (
                            <Button onClick={handleCreate} className="gap-2">
                                <Plus className="w-4 h-4" />
                                Adicionar Veículo
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
