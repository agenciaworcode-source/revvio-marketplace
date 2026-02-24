import React, { useState, useEffect, useCallback } from 'react';
import { FaFilter, FaSearch, FaCarSide, FaDollarSign, FaCalendarAlt, FaTachometerAlt, FaShieldAlt, FaChevronDown, FaTimes } from 'react-icons/fa';
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
    isOpen?: boolean;
    onClose?: () => void;
}

export const SidebarFilters: React.FC<SidebarFiltersProps> = ({ filters, setFilters, onClear, isOpen, onClose }) => {
    const availableMakes = carBrands.sort();

    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        search: true,
        make: true,
        price: true,
        year: false,
        mileage: false,
        armored: false
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFilters(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const toggleSection = (key: string) => {
        setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const activeFilterCount = useCallback(() => {
        let count = 0;
        if (filters.search) count++;
        if (filters.make) count++;
        if (filters.minPrice || filters.maxPrice) count++;
        if (filters.minYear || filters.maxYear) count++;
        if (filters.minMileage || filters.maxMileage) count++;
        if (filters.isArmored) count++;
        return count;
    }, [filters]);

    // Lock body scroll when panel is open on mobile
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleApply = () => {
        if (onClose) onClose();
    };

    const handleClearAndClose = () => {
        onClear();
    };

    const count = activeFilterCount();

    const filterContent = (
        <>
            {/* Search Section */}
            <div className="filter-section">
                <div className="filter-section-header" onClick={() => toggleSection('search')}>
                    <label><FaSearch className="section-icon" /> Busca</label>
                    <FaChevronDown className={`filter-section-chevron ${openSections.search ? 'open' : ''}`} />
                </div>
                <div className={`filter-section-body ${openSections.search ? 'open' : ''}`}>
                    <input
                        name="search"
                        type="text"
                        placeholder="Ex: 2.0, Ka, Civic..."
                        className="input-field"
                        value={filters.search}
                        onChange={handleChange}
                    />
                </div>
            </div>

            {/* Make Section */}
            <div className="filter-section">
                <div className="filter-section-header" onClick={() => toggleSection('make')}>
                    <label><FaCarSide className="section-icon" /> Marca</label>
                    <FaChevronDown className={`filter-section-chevron ${openSections.make ? 'open' : ''}`} />
                </div>
                <div className={`filter-section-body ${openSections.make ? 'open' : ''}`}>
                    <select name="make" className="select-field" value={filters.make} onChange={handleChange}>
                        <option value="">Todas as marcas</option>
                        {availableMakes.map(make => (
                            <option key={make} value={make}>{make}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Price Section */}
            <div className="filter-section">
                <div className="filter-section-header" onClick={() => toggleSection('price')}>
                    <label><FaDollarSign className="section-icon" /> Preço</label>
                    <FaChevronDown className={`filter-section-chevron ${openSections.price ? 'open' : ''}`} />
                </div>
                <div className={`filter-section-body ${openSections.price ? 'open' : ''}`}>
                    <div className="range-inputs">
                        <input name="minPrice" type="number" placeholder="De" value={filters.minPrice} onChange={handleChange} />
                        <input name="maxPrice" type="number" placeholder="Até" value={filters.maxPrice} onChange={handleChange} />
                    </div>
                </div>
            </div>

            {/* Year Section */}
            <div className="filter-section">
                <div className="filter-section-header" onClick={() => toggleSection('year')}>
                    <label><FaCalendarAlt className="section-icon" /> Ano</label>
                    <FaChevronDown className={`filter-section-chevron ${openSections.year ? 'open' : ''}`} />
                </div>
                <div className={`filter-section-body ${openSections.year ? 'open' : ''}`}>
                    <div className="range-inputs">
                        <input name="minYear" type="number" placeholder="De" value={filters.minYear} onChange={handleChange} />
                        <input name="maxYear" type="number" placeholder="Até" value={filters.maxYear} onChange={handleChange} />
                    </div>
                </div>
            </div>

            {/* Mileage Section */}
            <div className="filter-section">
                <div className="filter-section-header" onClick={() => toggleSection('mileage')}>
                    <label><FaTachometerAlt className="section-icon" /> Quilometragem</label>
                    <FaChevronDown className={`filter-section-chevron ${openSections.mileage ? 'open' : ''}`} />
                </div>
                <div className={`filter-section-body ${openSections.mileage ? 'open' : ''}`}>
                    <div className="range-inputs">
                        <input name="minMileage" type="number" placeholder="De" value={filters.minMileage} onChange={handleChange} />
                        <input name="maxMileage" type="number" placeholder="Até" value={filters.maxMileage} onChange={handleChange} />
                    </div>
                </div>
            </div>

            {/* Armored Toggle Section */}
            <div className="filter-section">
                <div className="filter-section-header" onClick={() => toggleSection('armored')}>
                    <label><FaShieldAlt className="section-icon" /> Blindado</label>
                    <FaChevronDown className={`filter-section-chevron ${openSections.armored ? 'open' : ''}`} />
                </div>
                <div className={`filter-section-body ${openSections.armored ? 'open' : ''}`}>
                    <div className="toggle-group">
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>Apenas blindados</span>
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
                </div>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`filters-overlay ${isOpen ? 'active visible' : ''}`}
                onClick={onClose}
            />

            {/* Sidebar / Full-screen panel */}
            <aside className={`filters-sidebar ${isOpen ? 'mobile-open' : ''}`}>
                {/* Header (sticky on mobile) */}
                <div className="filters-header">
                    <div className="filters-header-left">
                        <FaFilter className="filter-icon" />
                        <h2>FILTROS</h2>
                        {count > 0 && <span className="active-filters-badge">{count}</span>}
                    </div>
                    <button className="filters-close-btn" onClick={onClose} title="Fechar filtros">
                        <FaTimes />
                    </button>
                </div>

                {/* Scrollable body (on mobile wraps in div, on desktop renders inline) */}
                <div className="filters-mobile-body">
                    {filterContent}

                    {/* Desktop-only actions */}
                    <div className="filter-actions filter-actions-desktop">
                        <button className="clean-filters" onClick={onClear}>
                            Limpar Filtros
                        </button>
                    </div>
                </div>

                {/* Mobile-only sticky footer */}
                <div className="filters-mobile-footer">
                    <button className="btn-clear-mobile" onClick={handleClearAndClose}>
                        Limpar
                    </button>
                    <button className="btn-apply-mobile" onClick={handleApply}>
                        Aplicar Filtros {count > 0 ? `(${count})` : ''}
                    </button>
                </div>
            </aside>
        </>
    );
};
