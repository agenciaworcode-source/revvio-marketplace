import React from 'react';
import type { Vehicle } from '../data';
import { FaRegClock, FaRegCalendarAlt } from 'react-icons/fa';
import { BsShieldShaded } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import './VehicleCard.css';

interface VehicleCardProps {
    vehicle: Vehicle;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle }) => {
    const navigate = useNavigate();

    const formatPrice = (value: number) => {
        return value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    };

    const formatMileage = (value: number) => {
        return value.toLocaleString('pt-BR');
    };

    return (
        <div className="vehicle-card" onClick={() => navigate(`/vehicle/${vehicle.id}`)} style={{ cursor: 'pointer' }}>
            <div className="card-image-wrapper">
                <img src={vehicle.images?.[0] || 'https://via.placeholder.com/300'} alt={`${vehicle.make} ${vehicle.model}`} className="card-image" />
                {vehicle.isArmored && (
                    <div className="armored-badge">
                        <BsShieldShaded />
                        <span>Blindado</span>
                    </div>
                )}
            </div>

            <div className="card-content">
                <div className="card-header">
                    <h3 className="vehicle-make">{vehicle.make}</h3>
                    <p className="vehicle-model">{vehicle.model}</p>
                </div>

                <div className="vehicle-specs">
                    <div className="spec-item">
                        <FaRegClock className="spec-icon" />
                        <span>{formatMileage(vehicle.mileage)}</span>
                    </div>
                    <div className="spec-item">
                        <FaRegCalendarAlt className="spec-icon" />
                        <span>{vehicle.yearModel}</span>
                    </div>
                </div>

                <div className="price-section">
                    {vehicle.oldPrice && (
                        <p className="old-price">DE R$ {formatPrice(vehicle.oldPrice)}</p>
                    )}
                    <p className="current-price">
                        {vehicle.oldPrice && <span className="por-label">POR </span>}
                        R$ {formatPrice(vehicle.price)}
                    </p>
                </div>
            </div>
        </div>
    );
};
