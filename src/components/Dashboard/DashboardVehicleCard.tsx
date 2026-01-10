import React from 'react';
import type { Vehicle } from '../../data';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import './DashboardVehicleCard.css';

interface DashboardVehicleCardProps {
    vehicle: Vehicle;
    onView: (vehicle: Vehicle) => void;
    onEdit: (vehicle: Vehicle) => void;
    onDelete: (id: number) => void;
}

export const DashboardVehicleCard: React.FC<DashboardVehicleCardProps> = ({
    vehicle,
    onView,
    onEdit,
    onDelete,
}) => {
    const statusLabels: Record<string, string> = {
        active: 'Ativo',
        reserved: 'Reservado',
        sold: 'Vendido'
    };

    const statusColors: Record<string, string> = {
        active: '#2ABB9B',
        reserved: '#F39C12',
        sold: '#95A5A6'
    };

    const formatPrice = (value: number) => {
        return value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    };

    const formatMileage = (value: number) => {
        return value.toLocaleString('pt-BR');
    };

    const currentStatus = vehicle.status || 'active';

    return (
        <div className="dash-vehicle-card">
            <div className="dash-card-image-wrapper">
                <img src={vehicle.images?.[0] || 'https://via.placeholder.com/150'} alt={vehicle.model} className="dash-card-image" />
                <span
                    className="status-badge"
                    style={{ backgroundColor: statusColors[currentStatus] }}
                >
                    {statusLabels[currentStatus]}
                </span>
            </div>

            <div className="dash-card-content">
                <h3 className="dash-vehicle-title">{vehicle.make} {vehicle.model.split(' ')[0]}</h3>
                <p className="dash-vehicle-subtitle">
                    {vehicle.yearModel.split('/')[0]} • {formatMileage(vehicle.mileage)} km • {vehicle.color || 'N/A'}
                </p>
                <p className="dash-vehicle-price">R$ {formatPrice(vehicle.price)}</p>

                <div className="dash-card-actions">
                    <button className="action-btn view" onClick={() => onView(vehicle)}>
                        <FaEye /> Ver
                    </button>
                    <button className="action-btn edit" onClick={() => onEdit(vehicle)}>
                        <FaEdit /> Editar
                    </button>
                    <button className="action-btn delete" onClick={() => onDelete(vehicle.id)}>
                        <FaTrash />
                    </button>
                </div>
            </div>
        </div>
    );
};
