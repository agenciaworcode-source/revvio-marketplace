import React from 'react';
import type { Vehicle } from '../data';
import { FaRegClock, FaRegCalendarAlt } from 'react-icons/fa';
import { BsShieldShaded } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';


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
        <div 
            className="bg-white rounded-[6px] shadow-sm transition-all duration-200 flex flex-col group hover:-translate-y-1 hover:shadow-md cursor-pointer hover:rounded-lg hover:border-emerald-500 hover:border" 
            onClick={() => navigate(`/vehicle/${vehicle.id}`)}
        >
            <div className="relative aspect-video w-full overflow-hidden bg-gray-100 rounded-t-[10px]">
                <img 
                    src={vehicle.images?.[0] || 'https://via.placeholder.com/300'} 
                    alt={`${vehicle.make} ${vehicle.model}`} 
                    className="w-full h-full object-cover transition-transform duration-[800ms] group-hover:scale-105" 
                />
                {vehicle.isArmored && (
                    <div className="absolute bottom-0 left-0 right-0 bg-[#E74C3C] text-white flex justify-center items-center gap-2 p-2 text-sm font-semibold uppercase">
                        <BsShieldShaded />
                        <span>Blindado</span>
                    </div>
                )}
            </div>

            <div className="p-4 flex flex-col flex-grow">
                <div className="mb-4">
                    <h3 className="text-sm font-extrabold text-[#333] uppercase mb-1">{vehicle.make}</h3>
                    <p className="text-sm font-bold text-[#2ABB9B] uppercase leading-tight">{vehicle.model}</p>
                </div>

                <div className="flex justify-between mb-4 text-[#888] text-[13px]">
                    <div className="flex items-center gap-1.5">
                        <FaRegClock className="text-[#888]" />
                        <span>{formatMileage(vehicle.mileage)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <FaRegCalendarAlt className="text-[#888]" />
                        <span>{vehicle.yearModel}</span>
                    </div>
                </div>

                <div className="mt-auto">
                    {vehicle.belowFipe && (vehicle.fipePrice || vehicle.oldPrice || 0) > 0 ? (
                        <>
                            <p className="text-xs line-through text-[#888] mb-1">
                                DE R$ {formatPrice(vehicle.fipePrice || vehicle.oldPrice || 0)} (FIPE)
                            </p>
                            <p className="text-xl font-extrabold text-[#2ABB9B]">
                                <span className="text-sm font-semibold">POR </span>
                                R$ {formatPrice(vehicle.price)}
                            </p>
                        </>
                    ) : (
                        <p className="text-xl font-extrabold text-[#2ABB9B]">
                            R$ {formatPrice((!vehicle.belowFipe && (vehicle.fipePrice || 0) > 0 && vehicle.price === 0) ? (vehicle.fipePrice || 0) : vehicle.price)}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
