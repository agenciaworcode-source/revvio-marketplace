import React, { useState, useMemo } from 'react';

import { Header } from '../components/Header';
import { SidebarFilters, type FilterState } from '../components/SidebarFilters';
import { VehicleCard } from '../components/VehicleCard';
import { useVehicles } from '../context/VehicleContext';
import { useAuth } from '../context/AuthContext';
import { LeadRegistrationForm } from '../components/LeadRegistrationForm';
import { FaChevronRight, FaFilter } from 'react-icons/fa';


const initialFilters: FilterState = {
    search: '',
    make: '',
    minPrice: '',
    maxPrice: '',
    minYear: '',
    maxYear: '',
    minMileage: '',
    maxMileage: '',
    isArmored: false,
    belowFipe: false
};

export const Home: React.FC = () => {
    const { vehicles, loading } = useVehicles();
    const { user, loading: authLoading } = useAuth();
    const [filters, setFilters] = useState<FilterState>(initialFilters);
    const [sortOrder, setSortOrder] = useState('relevance');
    const [filtersOpen, setFiltersOpen] = useState(false);

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.search) count++;
        if (filters.make) count++;
        if (filters.minPrice || filters.maxPrice) count++;
        if (filters.minYear || filters.maxYear) count++;
        if (filters.minMileage || filters.maxMileage) count++;
        if (filters.isArmored) count++;
        return count;
    }, [filters]);

    const filteredVehicles = useMemo(() => {
        return vehicles.filter(vehicle => {
            // 1. Basic Status Filter (Hide sold and pending)
            if (vehicle.status === 'sold' || vehicle.status === 'pending') return false;
            if (filters.belowFipe && !vehicle.belowFipe) return false;

            // 2. Search (Model, Version, Description)
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                const matchSearch =
                    vehicle.model.toLowerCase().includes(searchLower) ||
                    vehicle.version.toLowerCase().includes(searchLower) ||
                    vehicle.make.toLowerCase().includes(searchLower);
                if (!matchSearch) return false;
            }

            // 3. Make
            if (filters.make && vehicle.make !== filters.make) return false;

            // 4. Price
            if (filters.minPrice && vehicle.price < Number(filters.minPrice)) return false;
            if (filters.maxPrice && vehicle.price > Number(filters.maxPrice)) return false;

            // 5. Year (assuming format YYYY/YYYY or just YYYY)
            if (filters.minYear || filters.maxYear) {
                const vehicleYear = parseInt(vehicle.yearModel.split('/')[0]);
                if (filters.minYear && vehicleYear < Number(filters.minYear)) return false;
                if (filters.maxYear && vehicleYear > Number(filters.maxYear)) return false;
            }

            // 6. Mileage
            if (filters.minMileage && vehicle.mileage < Number(filters.minMileage)) return false;
            if (filters.maxMileage && vehicle.mileage > Number(filters.maxMileage)) return false;

            // 7. Armored
            if (filters.isArmored && !vehicle.isArmored) return false;

            return true;
        }).sort((a, b) => {
            if (sortOrder === 'price_asc') return a.price - b.price;
            if (sortOrder === 'price_desc') return b.price - a.price;
            return 0; // relevance (default order)
        });
    }, [vehicles, filters, sortOrder]);

    const handleClearFilters = () => {
        setFilters(initialFilters);
    };

    if (authLoading || (user && loading)) {
        return (
            <div className="app">
                <Header />
                <main className="main-container container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <h2>Carregando veículos...</h2>
                </main>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="app">
                <Header />
                <main className="bg-slate-50 min-h-screen py-8">
                     <LeadRegistrationForm />
                </main>
            </div>
        );
    }

    return (
        <div className="app">
            <Header />

            <main className="flex flex-col lg:flex-row max-w-7xl mx-auto py-6 px-4 gap-6 relative">

                <SidebarFilters
                    filters={filters}
                    setFilters={setFilters}
                    onClear={handleClearFilters}
                    isOpen={filtersOpen}
                    onClose={() => setFiltersOpen(false)}
                />

                <section className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                        <span>Home</span>
                        <FaChevronRight size={10} />
                        <span className="font-semibold text-slate-900">Comprar</span>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
                        <div className="text-slate-600 font-medium text-sm">
                            <span>{filteredVehicles.length} carros encontrados</span>
                        </div>
                        <div className="w-full sm:w-auto">
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="w-full sm:w-44 p-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-[#2ABB9B] focus:ring-1 focus:ring-[#2ABB9B]"
                            >
                                <option value="relevance">Relevância</option>
                                <option value="price_asc">Menor Preço</option>
                                <option value="price_desc">Maior Preço</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredVehicles.length > 0 ? (
                            filteredVehicles.map(vehicle => (
                                <VehicleCard key={vehicle.id} vehicle={vehicle} />
                            ))
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500">
                                <p className="text-lg font-medium">Nenhum veículo encontrado</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Mobile Floating Filter Button */}
                <button
                    className="filters-mobile-trigger"
                    onClick={() => setFiltersOpen(true)}
                >
                    <FaFilter className="trigger-icon" />
                    <span>Filtros</span>
                    {activeFilterCount > 0 && (
                        <span className="trigger-badge">{activeFilterCount}</span>
                    )}
                </button>
            </main>
        </div>
    );
};
