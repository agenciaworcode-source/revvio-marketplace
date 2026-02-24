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
            className="bg-white rounded-lg shadow-sm transition-all duration-200 flex flex-col group hover:-translate-y-1 hover:shadow-md cursor-pointer hover:border-emerald-500 hover:border" 
            onClick={() => navigate(`/vehicle/${vehicle.id}`)}
        >
            <div className="relative aspect-video w-full overflow-hidden bg-gray-100 rounded-t-lg">
                <img 
                    src={vehicle.images?.[0] || 'https://via.placeholder.com/300'} 
                    alt={`${vehicle.make} ${vehicle.model}`} 
                    className="w-full h-full object-cover transition-transform duration-[800ms] group-hover:scale-105" 
                />
                {vehicle.isArmored && (
                    <div className="absolute bottom-0 left-0 right-0 bg-[#E74C3C] text-white flex justify-center items-center gap-1.5 p-1.5 text-xs font-semibold uppercase">
                        <BsShieldShaded className="text-xs" />
                        <span>Blindado</span>
                    </div>
                )}
                {/* Photo count badge */}
                {vehicle.images && vehicle.images.length > 1 && (
                    <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-semibold px-2 py-1 rounded-full backdrop-blur-sm">
                        📷 {vehicle.images.length}
                    </div>
                )}
            </div>

            <div className="p-3 sm:p-4 flex flex-col flex-grow">
                <div className="mb-2 sm:mb-3">
                    <h3 className="text-xs sm:text-sm font-extrabold text-[#333] uppercase mb-0.5">{vehicle.make}</h3>
                    <p className="text-xs sm:text-sm font-bold text-[#2ABB9B] uppercase leading-tight line-clamp-1">{vehicle.model}</p>
                </div>

                <div className="flex justify-between mb-2 sm:mb-3 text-[#888] text-[11px] sm:text-[13px]">
                    <div className="flex items-center gap-1">
                        <FaRegClock className="text-[#888]" />
                        <span>{formatMileage(vehicle.mileage)} km</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <FaRegCalendarAlt className="text-[#888]" />
                        <span>{vehicle.yearModel}</span>
                    </div>
                </div>

                <div className="mt-auto">
                    {vehicle.belowFipe && (vehicle.fipePrice || vehicle.oldPrice || 0) > 0 ? (
                        <>
                            <p className="text-[10px] sm:text-xs line-through text-[#888] mb-0.5">
                                DE R$ {formatPrice(vehicle.fipePrice || vehicle.oldPrice || 0)} (FIPE)
                            </p>
                            <p className="text-lg sm:text-xl font-extrabold text-[#2ABB9B]">
                                <span className="text-[10px] sm:text-sm font-semibold">POR </span>
                                R$ {formatPrice(vehicle.price)}
                            </p>
                        </>
                    ) : (
                        <p className="text-lg sm:text-xl font-extrabold text-[#2ABB9B]">
                            R$ {formatPrice((!vehicle.belowFipe && (vehicle.fipePrice || 0) > 0 && vehicle.price === 0) ? (vehicle.fipePrice || 0) : vehicle.price)}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
