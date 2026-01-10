import React, { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { SidebarFilters, type FilterState } from '../components/SidebarFilters';
import { VehicleCard } from '../components/VehicleCard';
import { useVehicles } from '../context/VehicleContext';
import { FaChevronRight } from 'react-icons/fa';
import '../App.css';

const initialFilters: FilterState = {
    search: '',
    make: '',
    minPrice: '',
    maxPrice: '',
    minYear: '',
    maxYear: '',
    minMileage: '',
    maxMileage: '',
    isArmored: false
};

export const Home: React.FC = () => {
    const { vehicles, loading } = useVehicles();
    const [filters, setFilters] = useState<FilterState>(initialFilters);
    const [sortOrder, setSortOrder] = useState('relevance');

    const filteredVehicles = useMemo(() => {
        return vehicles.filter(vehicle => {
            // 1. Basic Status Filter (Hide sold and pending)
            if (vehicle.status === 'sold' || vehicle.status === 'pending') return false;

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

    if (loading) {
        return (
            <div className="app">
                <Header />
                <main className="main-container container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <h2>Carregando veículos...</h2>
                </main>
            </div>
        );
    }

    return (
        <div className="app">
            <Header />

            <main className="main-container container">
                <SidebarFilters
                    filters={filters}
                    setFilters={setFilters}
                    onClear={handleClearFilters}
                />

                <section className="content-area">
                    <div className="breadcrumbs">
                        <span>Home</span>
                        <FaChevronRight size={10} />
                        <span className="current">Comprar</span>
                    </div>

                    <div className="controls-bar">
                        <div className="spacer">
                            <span>{filteredVehicles.length} carros encontrados</span>
                        </div>
                        <div className="sort-control">
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="sort-select"
                            >
                                <option value="relevance">Relevância</option>
                                <option value="price_asc">Menor Preço</option>
                                <option value="price_desc">Maior Preço</option>
                            </select>
                        </div>
                    </div>

                    <div className="vehicle-grid">
                        {filteredVehicles.length > 0 ? (
                            filteredVehicles.map(vehicle => (
                                <VehicleCard key={vehicle.id} vehicle={vehicle} />
                            ))
                        ) : (
                            <div className="no-results">
                                <p>Nenhum veículo encontrado com os filtros selecionados.</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

