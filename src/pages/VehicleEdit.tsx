import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVehicles } from '../context/VehicleContext';
import { defaultOptions, type Vehicle } from '../data';
import { vehicleService } from '../services/vehicleService';
import { FaArrowLeft, FaCar, FaUser, FaSave, FaList } from 'react-icons/fa';
import './VehicleEdit.css';

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
    description: '',
    owner: {
        name: '',
        phone: '',
        email: ''
    }
};

export const VehicleEdit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getVehicle, addVehicle, updateVehicle } = useVehicles();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState<Partial<Vehicle>>(emptyVehicle);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (id) {
            const vehicle = getVehicle(Number(id));
            if (vehicle) {
                setFormData(JSON.parse(JSON.stringify(vehicle))); // Deep copy to handle nested owner object safely
            } else {
                navigate('/dashboard');
            }
        }
    }, [id, getVehicle, navigate]);

    // ... (keep handleChange, handleOwnerChange, handleOptionChange)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        let checked = false;

        if (e.target instanceof HTMLInputElement && type === 'checkbox') {
            checked = e.target.checked;
        }

        setFormData((prev: Partial<Vehicle>) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
        }));
    };

    const handleOwnerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev: Partial<Vehicle>) => ({
            ...prev,
            owner: {
                ...prev.owner!,
                [name]: value
            }
        }));
    };

    const handleOptionChange = (option: string) => {
        setFormData((prev: Partial<Vehicle>) => {
            const currentOptions = prev.options || [];
            if (currentOptions.includes(option)) {
                return { ...prev, options: currentOptions.filter((o: string) => o !== option) };
            } else {
                return { ...prev, options: [...currentOptions, option] };
            }
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setImageFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeNewImage = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images?.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.make || !formData.model) {
            alert('Por favor, preencha Marca e Modelo.');
            return;
        }

        try {
            setUploading(true);
            let uploadedUrls: string[] = [];

            if (imageFiles.length > 0) {
                uploadedUrls = await vehicleService.uploadImages(imageFiles);
            }

            const currentImages = formData.images || [];
            const finalImages = [...currentImages, ...uploadedUrls];

            const vehicleData = {
                ...formData,
                images: finalImages
            };

            if (isEdit && id) {
                // Ensure ID is present for update
                const vehicleToUpdate = { ...vehicleData, id: Number(id) } as Vehicle;
                await updateVehicle(vehicleToUpdate);
            } else {
                // For new vehicle, ensure we treat it as Omit<Vehicle, 'id'>
                const vehicleToCreate = vehicleData as Omit<Vehicle, 'id'>;
                await addVehicle(vehicleToCreate);
            }

            navigate('/dashboard');
        } catch (error) {
            console.error('Error saving vehicle:', error);
            alert('Erro ao salvar veículo: ' + (error as any).message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="vehicle-edit-page">

            <div className="edit-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="btn-cancel" style={{ padding: '0.5rem', background: 'transparent' }} onClick={() => navigate('/dashboard')}>
                        <FaArrowLeft size={24} />
                    </button>
                    <h1>{isEdit ? 'Editar Veículo' : 'Novo Veículo'}</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Vehicle Data Section */}
                <section className="form-section">
                    <div className="section-title">
                        <FaCar />
                        <span>Dados do Veículo</span>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Marca</label>
                            <input name="make" value={formData.make || ''} onChange={handleChange} placeholder="Ex: VOLKSWAGEN" required />
                        </div>
                        <div className="form-group">
                            <label>Modelo</label>
                            <input name="model" value={formData.model || ''} onChange={handleChange} placeholder="Ex: TIGUAN" required />
                        </div>
                        <div className="form-group">
                            <label>Versão</label>
                            <input name="version" value={formData.version || ''} onChange={handleChange} placeholder="Ex: 2.0 TSI" />
                        </div>
                        <div className="form-group">
                            <label>Ano/Modelo</label>
                            <input name="yearModel" value={formData.yearModel || ''} onChange={handleChange} placeholder="Ex: 2012/2012" />
                        </div>
                        <div className="form-group">
                            <label>Placa (Final)</label>
                            <input name="plate" value={formData.plate || ''} onChange={handleChange} placeholder="Ex: Final 8" />
                        </div>
                        <div className="form-group">
                            <label>Cidade</label>
                            <input name="location" value={formData.location || ''} onChange={handleChange} placeholder="Ex: São Paulo - SP" />
                        </div>
                        <div className="form-group">
                            <label>Cor</label>
                            <input name="color" value={formData.color || ''} onChange={handleChange} placeholder="Ex: Branco" />
                        </div>
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
                        <div className="form-group">
                            <label>Quilometragem (km)</label>
                            <input type="number" name="mileage" value={formData.mileage || 0} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Preço (R$)</label>
                            <input type="number" name="price" value={formData.price || 0} onChange={handleChange} step="0.01" />
                        </div>
                        <div className="form-group">
                            <label>Status</label>
                            <select name="status" value={formData.status || 'active'} onChange={handleChange}>
                                <option value="pending">Pendente (Aguardando Aprovação)</option>
                                <option value="active">Ativo (Marketplace)</option>
                                <option value="reserved">Reservado</option>
                                <option value="sold">Vendido</option>
                            </select>
                        </div>
                        <div className="form-group checkbox-group" style={{ paddingTop: '2.5rem' }}>
                            <input type="checkbox" name="isArmored" checked={formData.isArmored || false} onChange={handleChange} id="isArmored" />
                            <label htmlFor="isArmored" style={{ cursor: 'pointer', color: '#fff' }}>Blindado</label>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '1.5rem' }}>
                        <label>Imagens do Veículo</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                        />
                        {uploading && <p>Enviando imagens...</p>}

                        <div className="images-preview-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                            {/* Existing Images */}
                            {formData.images?.map((imgUrl, idx) => (
                                <div key={`exist-${idx}`} style={{ position: 'relative' }}>
                                    <img
                                        src={imgUrl}
                                        alt={`Preview ${idx}`}
                                        style={{ width: '100px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeExistingImage(idx)}
                                        style={{
                                            position: 'absolute', top: -5, right: -5, background: 'red', color: 'white',
                                            border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px'
                                        }}
                                    >
                                        X
                                    </button>
                                </div>
                            ))}

                            {/* New Images */}
                            {imageFiles.map((file, idx) => (
                                <div key={`new-${idx}`} style={{ position: 'relative' }}>
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={`New Preview ${idx}`}
                                        style={{ width: '100px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '2px solid #2ABB9B' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeNewImage(idx)}
                                        style={{
                                            position: 'absolute', top: -5, right: -5, background: 'red', color: 'white',
                                            border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px'
                                        }}
                                    >
                                        X
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Owner Data Section */}
                <section className="form-section">
                    <div className="section-title">
                        <FaUser />
                        <span>Dados do Proprietário (Revenda)</span>
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Nome Completo</label>
                            <input
                                name="name"
                                value={formData.owner?.name || ''}
                                onChange={handleOwnerChange}
                                placeholder="Nome do proprietário anterior"
                            />
                        </div>
                        <div className="form-group">
                            <label>Telefone / WhatsApp</label>
                            <input
                                name="phone"
                                value={formData.owner?.phone || ''}
                                onChange={handleOwnerChange}
                                placeholder="(11) 99999-9999"
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.owner?.email || ''}
                                onChange={handleOwnerChange}
                                placeholder="email@exemplo.com"
                            />
                        </div>
                    </div>
                </section>

                {/* Options Section */}
                <section className="form-section">
                    <div className="section-title">
                        <FaList />
                        <span>Opcionais</span>
                    </div>
                    <div className="options-grid">
                        {defaultOptions.map(opt => (
                            <label key={opt} className="option-item">
                                <input
                                    type="checkbox"
                                    checked={formData.options?.includes(opt) || false}
                                    onChange={() => handleOptionChange(opt)}
                                />
                                <span>{opt}</span>
                            </label>
                        ))}
                    </div>
                </section>

                {/* Description */}
                <section className="form-section">
                    <div className="form-group">
                        <label>Descrição / Observações</label>
                        <textarea
                            name="description"
                            value={formData.description || ''}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Descreva detalhes adicionais sobre o veículo..."
                        />
                    </div>
                </section>

                <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={() => navigate('/dashboard')}>
                        Cancelar
                    </button>
                    <button type="submit" className="btn-save">
                        <FaSave style={{ marginRight: '8px' }} />
                        Salvar
                    </button>
                </div>
            </form>
        </div>
    );
};
