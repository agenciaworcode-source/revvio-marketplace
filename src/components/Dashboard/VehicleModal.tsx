import React, { useState, useEffect } from 'react';
import { type Vehicle, defaultOptions, carBrands } from '../../data';
import { FaTimes } from 'react-icons/fa';
import './VehicleModal.css';

interface VehicleModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'view' | 'edit' | 'create';
    vehicle?: Vehicle | null;
    onSave: (vehicle: Vehicle) => void;
}

const emptyVehicle: Omit<Vehicle, 'id'> = {
    make: '',
    model: '',
    version: '',
    yearModel: new Date().getFullYear().toString(),
    mileage: 0,
    price: 0,
    oldPrice: 0,
    isArmored: false,
    images: [],
    status: 'active',
    color: '',
    fuel: 'Flex',
    transmission: 'Automático',
    plate: '',
    options: [],
    description: ''
};

export const VehicleModal: React.FC<VehicleModalProps> = ({
    isOpen,
    onClose,
    mode,
    vehicle,
    onSave
}) => {
    const [formData, setFormData] = useState<Partial<Vehicle>>(emptyVehicle);

    useEffect(() => {
        if (isOpen) {
            if (mode === 'create') {
                setFormData({ ...emptyVehicle, images: ['https://images.unsplash.com/photo-1533473359331-0135ef1bcfb0?auto=format&fit=crop&w=500&q=60'] }); // Default image for demo
            } else if (vehicle) {
                setFormData({ ...vehicle });
            }
        }
    }, [isOpen, mode, vehicle]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        let checked = false;

        if (e.target instanceof HTMLInputElement && type === 'checkbox') {
            checked = e.target.checked;
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
        }));
    };

    const handleOptionChange = (option: string) => {
        setFormData(prev => {
            const currentOptions = prev.options || [];
            if (currentOptions.includes(option)) {
                return { ...prev, options: currentOptions.filter(o => o !== option) };
            } else {
                return { ...prev, options: [...currentOptions, option] };
            }
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData(prev => {
            const newImages = [...(prev.images || [])];
            if (newImages.length === 0) {
                newImages.push(value);
            } else {
                newImages[0] = value;
            }
            return { ...prev, images: newImages };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic validation
        if (!formData.make || !formData.model || !formData.price) {
            alert('Por favor, preencha Marca, Modelo e Preço.');
            return;
        }

        // Ensure ID is present for edit, or generated for create (handled by parent usually, but valid object needed)
        // Here we just pass back the form data which should match Vehicle structure mostly.
        // For 'create', ID will be assigned by parent.
        onSave(formData as Vehicle);
    };

    const renderTitle = () => {
        switch (mode) {
            case 'view': return 'Detalhes do Veículo';
            case 'edit': return 'Editar Veículo';
            case 'create': return 'Novo Veículo';
        }
    };

    if (mode === 'view' && vehicle) {
        return (
            <div className="vehicle-modal-overlay" onClick={onClose}>
                <div className="vehicle-modal" onClick={e => e.stopPropagation()}>
                    <div className="vehicle-modal-header">
                        <h2 className="vehicle-modal-title">{renderTitle()}</h2>
                        <button className="vehicle-modal-close" onClick={onClose}>
                            <FaTimes />
                        </button>
                    </div>
                    <div className="vehicle-modal-content">
                        {vehicle.images && vehicle.images.length > 0 && (
                            <img src={vehicle.images[0]} alt={vehicle.model} className="vehicle-image-preview" />
                        )}
                        <div className="vehicle-details-view">
                            <div className="detail-row">
                                <span className="detail-label">Marca/Modelo</span>
                                <span className="detail-value">{vehicle.make} {vehicle.model}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Versão</span>
                                <span className="detail-value">{vehicle.version}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Ano/Modelo</span>
                                <span className="detail-value">{vehicle.yearModel}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Cor</span>
                                <span className="detail-value">{vehicle.color || '-'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Quilometragem</span>
                                <span className="detail-value">{vehicle.mileage.toLocaleString()} km</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Câmbio/Combustível</span>
                                <span className="detail-value">{vehicle.transmission} / {vehicle.fuel}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Final da Placa</span>
                                <span className="detail-value">{vehicle.plate || '-'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Preço</span>
                                <span className="detail-value">R$ {vehicle.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Blindado</span>
                                <span className="detail-value">{vehicle.isArmored ? 'Sim' : 'Não'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Status</span>
                                <span className="detail-value" style={{ textTransform: 'capitalize' }}>
                                    {vehicle.status === 'active' ? 'Ativo' :
                                        vehicle.status === 'reserved' ? 'Reservado' : 'Vendido'}
                                </span>
                            </div>
                            {vehicle.options && vehicle.options.length > 0 && (
                                <div className="detail-row" style={{ flexDirection: 'column', alignItems: 'flex-start', border: 'none' }}>
                                    <span className="detail-label" style={{ marginBottom: '5px' }}>Opcionais</span>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                        {vehicle.options.map(opt => (
                                            <span key={opt} style={{ background: '#333', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>{opt}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="vehicle-modal-footer">
                        <button className="cancel-btn" onClick={onClose}>Fechar</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="vehicle-modal-overlay" onClick={onClose}>
            <div className="vehicle-modal" onClick={e => e.stopPropagation()}>
                <div className="vehicle-modal-header">
                    <h2 className="vehicle-modal-title">{renderTitle()}</h2>
                    <button className="vehicle-modal-close" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="vehicle-modal-content vehicle-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Marca</label>
                                <select
                                    name="make"
                                    value={formData.make || ''}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Selecione a Marca</option>
                                    {carBrands.sort().map(brand => (
                                        <option key={brand} value={brand}>{brand}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Modelo</label>
                                <input
                                    name="model"
                                    value={formData.model || ''}
                                    onChange={handleChange}
                                    placeholder="Ex: TIGUAN..."
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Versão</label>
                                <input
                                    name="version"
                                    value={formData.version || ''}
                                    onChange={handleChange}
                                    placeholder="Ex: 2.0 TSI..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Placa (Final)</label>
                                <input
                                    name="plate"
                                    value={formData.plate || ''}
                                    onChange={handleChange}
                                    placeholder="Ex: Final 8"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Ano/Modelo</label>
                                <input
                                    name="yearModel"
                                    value={formData.yearModel || ''}
                                    onChange={handleChange}
                                    placeholder="Ex: 2012/2012"
                                />
                            </div>
                            <div className="form-group">
                                <label>Cor</label>
                                <input
                                    name="color"
                                    value={formData.color || ''}
                                    onChange={handleChange}
                                    placeholder="Ex: Branco"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Câmbio</label>
                                <select name="transmission" value={formData.transmission || 'Automático'} onChange={handleChange}>
                                    <option value="Automático">Automático</option>
                                    <option value="Manual">Manual</option>
                                    <option value="CVT">CVT</option>
                                    <option value="Automatizado">Automatizado</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Combustível</label>
                                <select name="fuel" value={formData.fuel || 'Flex'} onChange={handleChange}>
                                    <option value="Gasolina">Gasolina</option>
                                    <option value="Álcool">Álcool</option>
                                    <option value="Flex">Flex</option>
                                    <option value="Diesel">Diesel</option>
                                    <option value="Híbrido">Híbrido</option>
                                    <option value="Elétrico">Elétrico</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Quilometragem (km)</label>
                                <input
                                    type="number"
                                    name="mileage"
                                    value={formData.mileage || 0}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Preço (R$)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price || 0}
                                    onChange={handleChange}
                                    step="0.01"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Status</label>
                                <select name="status" value={formData.status || 'active'} onChange={handleChange}>
                                    <option value="active">Ativo</option>
                                    <option value="reserved">Reservado</option>
                                    <option value="sold">Vendido</option>
                                </select>
                            </div>
                            <div className="form-group checkbox-group" style={{ justifyContent: 'flex-start', paddingTop: '30px' }}>
                                <input
                                    type="checkbox"
                                    name="isArmored"
                                    checked={formData.isArmored || false}
                                    onChange={handleChange}
                                    id="isArmored"
                                />
                                <label htmlFor="isArmored" style={{ margin: 0, cursor: 'pointer' }}>Blindado</label>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>URL da Imagem</label>
                            <input
                                name="imageURL"
                                value={formData.images?.[0] || ''}
                                onChange={handleImageChange}
                                placeholder="https://..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Descrição / Observações</label>
                            <textarea
                                name="description"
                                value={formData.description || ''}
                                onChange={handleChange}
                                className="modal-textarea"
                                rows={3}
                                style={{
                                    background: '#2c2c2c',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '6px',
                                    padding: '10px',
                                    color: '#fff',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ marginBottom: '10px', display: 'block' }}>Opcionais</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
                                {defaultOptions.map(opt => (
                                    <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.options?.includes(opt) || false}
                                            onChange={() => handleOptionChange(opt)}
                                            style={{ accentColor: '#2ABB9B', width: '16px', height: '16px' }}
                                        />
                                        {opt}
                                    </label>
                                ))}
                            </div>
                        </div>

                    </div>

                    <div className="vehicle-modal-footer">
                        <button type="button" className="cancel-btn" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="save-btn">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
