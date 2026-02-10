import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVehicles } from '../context/VehicleContext';
import { defaultOptions, type Vehicle, carBrands } from '../data';
import { vehicleService } from '../services/vehicleService';
import { useFipe } from '../hooks/useFipe';

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
    },
    // Campos de Procedência
    originType: 'nacional',
    firstOwner: false,
    fromAuction: false,
    accidentHistory: false,
    documentationStatus: 'regular',
    ipvaPaid: false,
    warranty: false,
    belowFipe: false
};

type Tab = 'general' | 'specs' | 'media' | 'pricing' | 'history' | 'fipe' | 'owner';

export const VehicleEdit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getVehicle, addVehicle, updateVehicle, owners } = useVehicles();
    const isEdit = Boolean(id);

    const [activeTab, setActiveTab] = useState<Tab>('general');
    const [formData, setFormData] = useState<Partial<Vehicle>>(emptyVehicle);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [ownerSelectionType, setOwnerSelectionType] = useState<'new' | 'existing'>('new');
    const fipe = useFipe();

    useEffect(() => {
        if (id) {
            const vehicle = getVehicle(Number(id));
            if (vehicle) {
                setFormData(JSON.parse(JSON.stringify(vehicle)));
            } else {
                navigate('/dashboard');
            }
        }
    }, [id, getVehicle, navigate]);

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

    const handleSelectExistingOwner = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOwner = owners.find(o => `${o.name}-${o.phone}` === e.target.value);
        if (selectedOwner) {
            setFormData((prev: Partial<Vehicle>) => ({
                ...prev,
                owner: {
                    name: selectedOwner.name,
                    phone: selectedOwner.phone,
                    email: selectedOwner.email
                }
            }));
        }
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
                const vehicleToUpdate = { ...vehicleData, id: Number(id) } as Vehicle;
                await updateVehicle(vehicleToUpdate);
            } else {
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

    const inputLabelClass = "text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5";
    const inputFieldClass = "w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-1 focus:ring-[#2ABB9B] focus:border-[#2ABB9B] outline-none transition-all";
    const sectionTitleClass = "text-base font-bold text-slate-900";
    const sectionDescClass = "text-xs text-slate-500 font-medium mb-6";
    const tabClass = (isActive: boolean) => `px-6 pb-4 text-sm font-bold transition-all border-b-2 cursor-pointer ${isActive ? 'text-[#2ABB9B] border-[#2ABB9B]' : 'text-slate-400 border-transparent hover:text-slate-600'}`;

    return (
        <div className="flex-1 flex flex-col bg-white h-full overflow-y-auto">
            <div className="px-10 py-10 max-w-5xl mx-auto w-full">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    <span className="hover:text-[#2ABB9B] transition-colors cursor-pointer" onClick={() => navigate('/dashboard')}>Inventário</span>
                    <span>/</span>
                    <span className="text-slate-900">{isEdit ? 'Editar Veículo' : 'Novo Veículo'}</span>
                </nav>

                {/* Header */}
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{isEdit ? 'Editar Detalhes do Veículo' : 'Adicionar Novo Veículo'}</h2>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Gerencie informações gerais e de categorização para esta unidade.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={uploading}
                            className="px-6 py-2 bg-[#2ABB9B] text-white text-sm font-bold rounded-lg hover:bg-[#25A086] transition-all shadow-sm disabled:opacity-50"
                        >
                            {uploading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-10 flex border-b border-slate-100 overflow-x-auto">
                    <div className={tabClass(activeTab === 'general')} onClick={() => setActiveTab('general')}>Informações Gerais</div>
                    <div className={tabClass(activeTab === 'specs')} onClick={() => setActiveTab('specs')}>Especificações</div>
                    <div className={tabClass(activeTab === 'media')} onClick={() => setActiveTab('media')}>Galeria de Mídia</div>
                    <div className={tabClass(activeTab === 'pricing')} onClick={() => setActiveTab('pricing')}>Precificação</div>
                    <div className={tabClass(activeTab === 'history')} onClick={() => setActiveTab('history')}>Procedência</div>
                    <div className={tabClass(activeTab === 'fipe')} onClick={() => setActiveTab('fipe')}>Tabela Fipe</div>
                    <div className={tabClass(activeTab === 'owner')} onClick={() => setActiveTab('owner')}>Dados do Proprietário</div>
                </div>

                {/* Content */}
                <div className="space-y-12 pb-24">
                    {activeTab === 'general' && (
                        <>
                            <section>
                                <h3 className={sectionTitleClass}>Detalhes Básicos</h3>
                                <p className={sectionDescClass}>Identificação primária e status atual.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                                    <div className="space-y-1.5">
                                        <label className={inputLabelClass}>Placa (Final)</label>
                                        <input name="plate" value={formData.plate || ''} onChange={handleChange} className={inputFieldClass} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className={inputLabelClass}>ID Estoque (Auto)</label>
                                        <input disabled value={id || 'Novo'} className={`${inputFieldClass} bg-slate-50 text-slate-500`} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className={inputLabelClass}>Condição</label>
                                        <select className={inputFieldClass}>
                                            <option>Usado</option>
                                            <option>Novo</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className={inputLabelClass}>Status Atual</label>
                                        <select name="status" value={formData.status || 'active'} onChange={handleChange} className={inputFieldClass}>
                                            <option value="active">Em Estoque / Disponível</option>
                                            <option value="reserved">Reservado</option>
                                            <option value="sold">Vendido / Entregue</option>
                                            <option value="pending">Serviço / Preparação</option>
                                        </select>
                                    </div>
                                </div>
                            </section>

                            <hr className="border-slate-100" />

                            <section>
                                <h3 className={sectionTitleClass}>Marca & Modelo</h3>
                                <p className={sectionDescClass}>Categorize o perfil técnico do veículo.</p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-1.5">
                                        <label className={inputLabelClass}>Ano de Fabricação</label>
                                        <input type="number" name="yearModel" value={formData.yearModel || ''} onChange={handleChange} className={inputFieldClass} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className={inputLabelClass}>Fabricante</label>
                                        <select name="make" value={formData.make || ''} onChange={handleChange} className={inputFieldClass}>
                                            <option value="">Selecione a Marca</option>
                                            {carBrands.sort().map(brand => (
                                                <option key={brand} value={brand}>{brand}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className={inputLabelClass}>Modelo</label>
                                        <input name="model" value={formData.model || ''} onChange={handleChange} className={inputFieldClass} />
                                    </div>

                                    <div className="md:col-span-3 space-y-1.5">
                                        <label className={inputLabelClass}>Notas Internas</label>
                                        <textarea
                                            name="description"
                                            value={formData.description || ''}
                                            onChange={handleChange}
                                            className={inputFieldClass}
                                            rows={3}
                                            placeholder="Adicione notas específicas da concessionária sobre esta unidade..."
                                        />
                                    </div>
                                </div>
                            </section>
                        </>
                    )}

                    {activeTab === 'specs' && (
                        <section>
                            <h3 className={sectionTitleClass}>Especificações do Veículo</h3>
                            <p className={sectionDescClass}>Especificações técnicas detalhadas.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                                <div className="space-y-1.5">
                                    <label className={inputLabelClass}>Quilometragem (km)</label>
                                    <input type="number" name="mileage" value={formData.mileage || 0} onChange={handleChange} className={inputFieldClass} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={inputLabelClass}>Cor</label>
                                    <input name="color" value={formData.color || ''} onChange={handleChange} className={inputFieldClass} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={inputLabelClass}>Câmbio</label>
                                    <select name="transmission" value={formData.transmission || 'Automático'} onChange={handleChange} className={inputFieldClass}>
                                        <option value="Automático">Automático</option>
                                        <option value="Manual">Manual</option>
                                        <option value="CVT">CVT</option>
                                        <option value="Automatizado">Automatizado</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className={inputLabelClass}>Tipo de Combustível</label>
                                    <select name="fuel" value={formData.fuel || 'Flex'} onChange={handleChange} className={inputFieldClass}>
                                        <option value="Gasolina">Gasolina</option>
                                        <option value="Álcool">Álcool</option>
                                        <option value="Flex">Flex</option>
                                        <option value="Diesel">Diesel</option>
                                        <option value="Híbrido">Híbrido</option>
                                        <option value="Elétrico">Elétrico</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2 space-y-1.5 pt-4">
                                    <label className={inputLabelClass}>Opcionais & Características</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {defaultOptions.map(option => (
                                            <label key={option} className="flex items-center gap-3 cursor-pointer bg-slate-50 p-3 rounded-lg border border-slate-100 hover:border-[#2ABB9B] transition-all">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.options?.includes(option)}
                                                    onChange={() => handleOptionChange(option)}
                                                    className="rounded border-slate-300 text-[#2ABB9B] focus:ring-[#2ABB9B]"
                                                />
                                                <span className="text-sm text-slate-700 font-medium">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {activeTab === 'media' && (
                        <section>
                             <h3 className={sectionTitleClass}>Galeria de Mídia</h3>
                             <p className={sectionDescClass}>Gerencie fotos e vídeos do veículo.</p>

                             <div className="space-y-6">
                                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-10 text-center">
                                    <p className="text-sm text-slate-500 font-medium mb-4">Arraste e solte suas imagens aqui, ou clique para navegar.</p>
                                    <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" id="file-upload" />
                                    <label htmlFor="file-upload" className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-lg cursor-pointer hover:bg-slate-50 shadow-sm transition-all">
                                        Selecionar Arquivos
                                    </label>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                     {formData.images?.map((url, index) => (
                                         <div key={url} className="relative group aspect-[4/3]">
                                            <img src={url} alt="" className="w-full h-full object-cover rounded-lg shadow-sm" />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(index)}
                                                className="absolute top-2 right-2 bg-white text-slate-900 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:text-red-600"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                            </button>
                                         </div>
                                     ))}
                                     {imageFiles.map((_file, index) => (
                                         <div key={index} className="relative group aspect-[4/3] bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Novo</span>
                                            <button
                                                type="button"
                                                onClick={() => removeNewImage(index)}
                                                className="absolute top-2 right-2 bg-white text-slate-900 rounded-full p-1 shadow-md hover:text-red-600"
                                            >
                                                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                            </button>
                                         </div>
                                     ))}
                                </div>
                             </div>
                        </section>
                    )}

                    {activeTab === 'pricing' && (
                        <section>
                             <h3 className={sectionTitleClass}>Precificação & Financeiro</h3>
                             <p className={sectionDescClass}>Defina o preço do veículo e gerencie informações fiscais.</p>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                                <div className="space-y-1.5">
                                    <label className={inputLabelClass}>Preço de Venda</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-slate-500 font-bold sm:text-sm">R$</span>
                                        </div>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price || 0}
                                            onChange={handleChange}
                                            className={`${inputFieldClass} pl-10`}
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5 md:col-span-2 pt-4">
                                     <div className="bg-[#e6fffa] p-6 rounded-lg border border-[#2abb9b]/30">
                                         <label className="flex items-center gap-3 cursor-pointer">
                                             <input
                                                 type="checkbox"
                                                 name="belowFipe"
                                                 checked={formData.belowFipe || false}
                                                 onChange={handleChange}
                                                 className="w-5 h-5 rounded border-slate-300 text-[#2abb9b] focus:ring-[#2abb9b]"
                                             />
                                             <div>
                                                 <span className="block text-sm font-bold text-slate-900">Oferta Abaixo da FIPE</span>
                                                 <span className="block text-xs text-slate-500 mt-1">Marcar esta opção destaca o veículo como uma ótima oferta.</span>
                                             </div>
                                         </label>
                                     </div>
                                </div>
                             </div>
                        </section>
                    )}

                    {activeTab === 'history' && (
                        <section>
                            <h3 className={sectionTitleClass}>Procedência e Histórico</h3>
                            <p className={sectionDescClass}>Detalhes sobre a origem e regularidade do veículo.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                                <div className="space-y-1.5">
                                    <label className={inputLabelClass}>Origem</label>
                                    <select name="originType" value={formData.originType || 'nacional'} onChange={handleChange} className={inputFieldClass}>
                                        <option value="nacional">Nacional</option>
                                        <option value="importado">Importado</option>
                                    </select>
                                </div>
                                {formData.originType === 'importado' && (
                                    <div className="space-y-1.5">
                                        <label className={inputLabelClass}>País de Origem</label>
                                        <input name="originCountry" value={formData.originCountry || ''} onChange={handleChange} className={inputFieldClass} placeholder="Ex: Alemanha" />
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className={inputLabelClass}>Documentação</label>
                                    <select name="documentationStatus" value={formData.documentationStatus || 'regular'} onChange={handleChange} className={inputFieldClass}>
                                        <option value="regular">Regular</option>
                                        <option value="pendente">Pendente</option>
                                        <option value="irregular">Irregular</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2 space-y-4 pt-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-3 rounded-lg border border-slate-100 hover:border-[#2ABB9B] transition-all">
                                            <input type="checkbox" name="firstOwner" checked={formData.firstOwner || false} onChange={handleChange} className="rounded text-[#2ABB9B] focus:ring-[#2ABB9B]" />
                                            <span className="text-sm font-medium text-slate-700">Primeiro Dono</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-3 rounded-lg border border-slate-100 hover:border-[#2ABB9B] transition-all">
                                            <input type="checkbox" name="ipvaPaid" checked={formData.ipvaPaid || false} onChange={handleChange} className="rounded text-[#2ABB9B] focus:ring-[#2ABB9B]" />
                                            <span className="text-sm font-medium text-slate-700">IPVA Pago</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-3 rounded-lg border border-slate-100 hover:border-[#2ABB9B] transition-all">
                                            <input type="checkbox" name="warranty" checked={formData.warranty || false} onChange={handleChange} className="rounded text-[#2ABB9B] focus:ring-[#2ABB9B]" />
                                            <span className="text-sm font-medium text-slate-700">Garantia Ativa</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-3 rounded-lg border border-slate-100 hover:border-[#2ABB9B] transition-all">
                                            <input type="checkbox" name="isArmored" checked={formData.isArmored || false} onChange={handleChange} className="rounded text-[#2ABB9B] focus:ring-[#2ABB9B]" />
                                            <span className="text-sm font-medium text-slate-700">Blindado</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="md:col-span-2 border-t border-slate-100 pt-6 mt-2 space-y-6">
                                     <div className="space-y-3">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" name="fromAuction" checked={formData.fromAuction || false} onChange={handleChange} className="rounded text-[#2ABB9B] focus:ring-[#2ABB9B]" />
                                            <span className="text-sm font-bold text-slate-900">Veículo de Leilão?</span>
                                        </label>
                                        {formData.fromAuction && (
                                            <textarea
                                                name="auctionDetails"
                                                value={formData.auctionDetails || ''}
                                                onChange={handleChange}
                                                className={inputFieldClass}
                                                placeholder="Descreva os detalhes do leilão..."
                                                rows={2}
                                            />
                                        )}
                                     </div>

                                     <div className="space-y-3">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" name="accidentHistory" checked={formData.accidentHistory || false} onChange={handleChange} className="rounded text-[#2ABB9B] focus:ring-[#2ABB9B]" />
                                            <span className="text-sm font-bold text-slate-900">Histórico de Sinistro / Acidentes?</span>
                                        </label>
                                        {formData.accidentHistory && (
                                            <textarea
                                                name="accidentDetails"
                                                value={formData.accidentDetails || ''}
                                                onChange={handleChange}
                                                className={inputFieldClass}
                                                placeholder="Descreva os danos ou histórico..."
                                                rows={2}
                                            />
                                        )}
                                     </div>
                                      <div className="space-y-3">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <span className="text-sm font-bold text-slate-900">Observações de Documentação</span>
                                        </label>
                                         <textarea
                                                name="documentationNotes"
                                                value={formData.documentationNotes || ''}
                                                onChange={handleChange}
                                                className={inputFieldClass}
                                                placeholder="Ex: Recibo em branco, dupla transferência..."
                                                rows={2}
                                            />
                                     </div>
                                </div>
                            </div>
                        </section>
                    )}

                     {activeTab === 'fipe' && (
                        <section>
                             <h3 className={sectionTitleClass}>Consulta Tabela Fipe</h3>
                             <p className={sectionDescClass}>Consulte os valores oficiais de mercado.</p>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
                                    <div className="space-y-1.5">
                                        <label className={inputLabelClass}>Marca</label>
                                        <select
                                            value={fipe.selectedBrand}
                                            onChange={(e) => fipe.setSelectedBrand(e.target.value)}
                                            disabled={fipe.loadingBrands}
                                            className={inputFieldClass}
                                        >
                                            <option value="">{fipe.loadingBrands ? 'Carregando...' : 'Selecione a Marca'}</option>
                                            {fipe.brands.map(brand => (
                                                <option key={brand.codigo} value={brand.codigo}>{brand.nome}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className={inputLabelClass}>Modelo</label>
                                        <select
                                            value={fipe.selectedModel}
                                            onChange={(e) => fipe.setSelectedModel(e.target.value)}
                                            disabled={!fipe.selectedBrand || fipe.loadingModels}
                                            className={inputFieldClass}
                                        >
                                            <option value="">{fipe.loadingModels ? 'Carregando...' : 'Selecione o Modelo'}</option>
                                            {fipe.models.map(model => (
                                                <option key={model.codigo} value={model.codigo}>{model.nome}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className={inputLabelClass}>Ano</label>
                                        <select
                                            value={fipe.selectedYear}
                                            onChange={(e) => fipe.setSelectedYear(e.target.value)}
                                            disabled={!fipe.selectedModel || fipe.loadingYears}
                                            className={inputFieldClass}
                                        >
                                            <option value="">{fipe.loadingYears ? 'Carregando...' : 'Selecione o Ano'}</option>
                                            {fipe.years.map(year => (
                                                <option key={year.codigo} value={year.codigo}>{year.nome}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {fipe.priceData && (
                                        <div className="md:col-span-3 pt-4 border-t border-slate-200 mt-2">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Valor Fipe</p>
                                                    <p className="text-2xl font-black text-[#2ABB9B]">{fipe.priceData.Valor}</p>
                                                    <p className="text-xs text-slate-400 mt-1">{fipe.priceData.MesReferencia}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const priceStr = fipe.priceData!.Valor.replace(/[^\d,]/g, '').replace(',', '.');
                                                        setFormData(p => ({
                                                            ...p,
                                                            price: parseFloat(priceStr),
                                                            make: fipe.priceData!.Marca,
                                                            model: fipe.priceData!.Modelo,
                                                            yearModel: fipe.priceData!.AnoModelo.toString()
                                                        }));
                                                        setActiveTab('general');
                                                    }}
                                                    className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-all"
                                                >
                                                    Usar Estes Dados
                                                </button>
                                            </div>
                                        </div>
                                    )}
                             </div>
                        </section>
                     )}
                     
                     {activeTab === 'owner' && (
                        <section>
                             <h3 className={sectionTitleClass}>Dados do Proprietário Anterior</h3>
                             <p className={sectionDescClass}>Detalhes sobre a procedência do veículo.</p>
                             
                             <div className="mb-6 flex gap-4">
                                <button
                                    onClick={() => setOwnerSelectionType('new')}
                                    className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${ownerSelectionType === 'new' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                >
                                    Novo Proprietário
                                </button>
                                <button
                                    onClick={() => setOwnerSelectionType('existing')}
                                    className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${ownerSelectionType === 'existing' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                >
                                    Cliente Existente
                                </button>
                             </div>

                             {ownerSelectionType === 'existing' ? (
                                 <div className="space-y-1.5 max-w-md">
                                     <label className={inputLabelClass}>Selecionar Cliente</label>
                                     <select onChange={handleSelectExistingOwner} className={inputFieldClass}>
                                        <option value="">Buscar cliente...</option>
                                        {owners.map(owner => (
                                            <option key={`${owner.name}-${owner.phone}`} value={`${owner.name}-${owner.phone}`}>
                                                {owner.name} ({owner.phone})
                                            </option>
                                        ))}
                                    </select>
                                 </div>
                             ) : (
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                                     <div className="space-y-1.5">
                                         <label className={inputLabelClass}>Nome Completo</label>
                                         <input name="name" value={formData.owner?.name || ''} onChange={handleOwnerChange} className={inputFieldClass} />
                                     </div>
                                     <div className="space-y-1.5">
                                         <label className={inputLabelClass}>Telefone / Whatsapp</label>
                                         <input name="phone" value={formData.owner?.phone || ''} onChange={handleOwnerChange} className={inputFieldClass} />
                                     </div>
                                     <div className="space-y-1.5 md:col-span-2">
                                         <label className={inputLabelClass}>Endereço de E-mail</label>
                                         <input name="email" value={formData.owner?.email || ''} onChange={handleOwnerChange} className={inputFieldClass} />
                                     </div>
                                 </div>
                             )}
                        </section>
                     )}

                </div>
            </div>
        </div>
    );
};
