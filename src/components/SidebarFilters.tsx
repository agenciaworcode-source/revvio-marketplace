import React from 'react';
import { FaFilter } from 'react-icons/fa';
import { carBrands } from '../data';
import './SidebarFilters.css';

export interface FilterState {
    search: string;
    make: string;
    minPrice: string;
    maxPrice: string;
    minYear: string;
    maxYear: string;
    minMileage: string;
    maxMileage: string;
    isArmored: boolean;
}

interface SidebarFiltersProps {
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
    onClear: () => void;
}

export const SidebarFilters: React.FC<SidebarFiltersProps> = ({ filters, setFilters, onClear }) => {
    const availableMakes = carBrands.sort();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFilters(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <aside className="filters-sidebar">
            <div className="filters-header">
                <FaFilter className="filter-icon" />
                <h2>FILTROS</h2>
            </div>

            <div className="filter-group">
                <label>Busca</label>
                <input
                    name="search"
                    type="text"
                    placeholder="2.0, ka, etc"
                    className="input-field"
                    value={filters.search}
                    onChange={handleChange}
                />
            </div>

            <div className="filter-group">
                <label>Marca do carro</label>
                <select name="make" className="select-field" value={filters.make} onChange={handleChange}>
                    <option value="">Todas</option>
                    {availableMakes.map(make => (
                        <option key={make} value={make}>{make}</option>
                    ))}
                </select>
            </div>

            <div className="filter-group">
                <label>Preço</label>
                <div className="range-inputs">
                    <input name="minPrice" type="number" placeholder="De" value={filters.minPrice} onChange={handleChange} />
                    <input name="maxPrice" type="number" placeholder="Até" value={filters.maxPrice} onChange={handleChange} />
                </div>
            </div>

            <div className="filter-group">
                <label>Ano</label>
                <div className="range-inputs">
                    <input name="minYear" type="number" placeholder="De" value={filters.minYear} onChange={handleChange} />
                    <input name="maxYear" type="number" placeholder="Até" value={filters.maxYear} onChange={handleChange} />
                </div>
            </div>

            <div className="filter-group">
                <label>Quilometragem (Km)</label>
                <div className="range-inputs">
                    <input name="minMileage" type="number" placeholder="De" value={filters.minMileage} onChange={handleChange} />
                    <input name="maxMileage" type="number" placeholder="Até" value={filters.maxMileage} onChange={handleChange} />
                </div>
            </div>

            <div className="filter-group toggle-group">
                <label>Blindado</label>
                <label className="switch">
                    <input
                        name="isArmored"
                        type="checkbox"
                        checked={filters.isArmored}
                        onChange={handleChange}
                    />
                    <span className="slider round"></span>
                </label>
            </div>

            <div className="filter-actions">
                <button className="clean-filters" onClick={onClear}>LIMPAR FILTROS</button>
            </div>
        </aside>
    );
};
