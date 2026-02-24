import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vehicleService } from '../services/vehicleService';
import { type Vehicle } from '../data';
import { Header } from '../components/Header';
import { ImageLightbox } from '../components/ImageLightbox';
import {
    FaChevronLeft, FaChevronRight, FaCalendarAlt, FaCogs,
    FaTachometerAlt, FaGasPump, FaPalette, FaBarcode, FaSpinner,
    FaCheckCircle, FaExclamationTriangle, FaShieldAlt, FaInfoCircle, FaGavel,
    FaExpand
} from 'react-icons/fa';
import { toast } from 'sonner';

export const VehicleDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);

    // Lightbox state
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const [leadFormData, setLeadFormData] = useState({
        name: '',
        phone: '',
        email: '',
        message: '',
        simulateFinancing: false
    });
    const [sendingLead, setSendingLead] = useState(false);

    useEffect(() => {
        const fetchVehicle = async () => {
            if (!id) return;
            try {
                const data = await vehicleService.getById(id);
                setVehicle(data);
            } catch (error) {
                console.error('Error fetching vehicle', error);
                setVehicle(null);
            } finally {
                setLoading(false);
            }
        };
        fetchVehicle();
    }, [id]);

    const handleLeadChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setLeadFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleLeadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!vehicle) return;

        if (!leadFormData.name || !leadFormData.phone) {
            toast.error('Por favor, preencha nome e telefone.');
            return;
        }

        setSendingLead(true);
        try {
            await vehicleService.sendLeadToWebhook({
                ...leadFormData,
                vehicleName: `${vehicle.make} ${vehicle.model} ${vehicle.version}`.trim()
            });

            toast.success('Mensagem enviada com sucesso!');
            setLeadFormData({
                name: '',
                phone: '',
                email: '',
                message: '',
                simulateFinancing: false
            });
        } catch (error) {
            console.error('Error sending lead:', error);
            toast.error('Erro ao enviar mensagem. Tente novamente mais tarde.');
        } finally {
            setSendingLead(false);
        }
    };

    // Open lightbox at a specific image index
    const openLightbox = (imgIndex: number) => {
        setLightboxIndex(imgIndex);
        setLightboxOpen(true);
    };

    if (loading) {
        return (
            <div className="bg-[#f4f4f4] min-h-screen pb-8">
                <Header />
                <div className="container mx-auto flex flex-col items-center justify-center min-h-[300px] gap-4">
                    <FaSpinner className="text-5xl text-[#2ABB9B] animate-spin" />
                    <h2 className="text-xl font-semibold">Carregando detalhes...</h2>
                </div>
            </div>
        );
    }

    if (!vehicle || vehicle.status === 'pending') {
        return (
            <div className="bg-[#f4f4f4] min-h-screen pb-8">
                <Header />
                <div className="container mx-auto p-12 text-center">
                    <h2 className="text-2xl font-bold mb-4">Veículo não encontrado</h2>
                    <button 
                        onClick={() => navigate('/')}
                        className="bg-[#2ABB9B] text-white px-5 py-2 rounded text-sm font-semibold hover:bg-[#24a085] transition-colors"
                    >
                        Voltar para Home
                    </button>
                </div>
            </div>
        );
    }

    const nextSlide = () => {
        if (!vehicle?.images?.length) return;
        setCurrentSlide((prev) => prev + 1);
    };

    const prevSlide = () => {
        if (!vehicle?.images?.length) return;
        setCurrentSlide((prev) => prev - 1);
    };

    const renderSlides = () => {
        if (!vehicle?.images || vehicle.images.length === 0) {
            return (
                <div className="absolute top-0 px-[2px] w-full h-full" style={{ left: '0%' }}>
                    <img src={'https://via.placeholder.com/800x400?text=Sem+Imagem'} alt="Sem Imagem" className="w-full h-full object-cover object-center" />
                </div>
            );
        }

        const slides: React.ReactNode[] = [];
        const buffer = 2;
        const visibleCount = 3;
        const start = currentSlide - buffer;
        const end = currentSlide + visibleCount + buffer;

        for (let i = start; i <= end; i++) {
            const imgIndex = ((i % vehicle.images.length) + vehicle.images.length) % vehicle.images.length;
            const img = vehicle.images[imgIndex];

            slides.push(
                <div
                    key={i}
                    className="absolute top-0 px-[2px] w-1/3 md:w-1/3 h-full box-border"
                    style={{ left: `${i * (100 / 3)}%` }}
                    onClick={() => openLightbox(imgIndex)}
                >
                    <img
                        src={img}
                        alt={`${vehicle.model} - ${imgIndex + 1}`}
                        className="w-full h-full object-cover object-center cursor-pointer"
                    />
                    {vehicle.isArmored && (
                        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-[#2ABB9B] text-white px-3 py-1 rounded font-bold text-xs flex items-center gap-1.5 shadow-md">
                            <span>🛡️</span> Blindado
                        </div>
                    )}
                </div>
            );
        }
        return slides;
    };

    return (
        <div className="bg-[#f4f4f4] min-h-screen pb-8">
            <Header />

            {/* Carousel */}
            <div className="relative w-full max-w-full mb-6 bg-black flex items-center justify-center">
                <button 
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 border-none w-9 h-9 rounded-full flex items-center justify-center cursor-pointer z-10 shadow-md hover:bg-white transition-colors text-sm"
                    onClick={prevSlide}
                >
                    <FaChevronLeft />
                </button>

                <div className="w-full overflow-hidden relative h-[220px] sm:h-[300px] md:h-[400px]">
                    <div
                        className="block relative h-full transition-transform duration-500 ease-in-out w-full"
                        style={{ transform: `translateX(-${currentSlide * (100 / 3)}%)` }}
                    >
                        {renderSlides()}
                    </div>
                </div>

                <button 
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 border-none w-9 h-9 rounded-full flex items-center justify-center cursor-pointer z-10 shadow-md hover:bg-white transition-colors text-sm"
                    onClick={nextSlide}
                >
                    <FaChevronRight />
                </button>

                {/* Photo counter + expand button */}
                {vehicle.images && vehicle.images.length > 0 && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-2 z-10">
                        <span className="bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
                            {((currentSlide % vehicle.images.length) + vehicle.images.length) % vehicle.images.length + 1} / {vehicle.images.length}
                        </span>
                        <button
                            onClick={() => openLightbox(((currentSlide % vehicle.images.length) + vehicle.images.length) % vehicle.images.length)}
                            className="bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors backdrop-blur-sm border-none cursor-pointer text-xs"
                            title="Expandir fotos"
                        >
                            <FaExpand />
                        </button>
                    </div>
                )}
            </div>

            <main className="container mx-auto px-4 max-w-7xl">
                <div className="mb-6 px-2 sm:px-4">
                    <div className="text-[#666] text-xs sm:text-sm mb-3">
                        Home <span className="text-[#ccc] mx-1">&gt;</span> Comprar <span className="text-[#ccc] mx-1">&gt;</span> {vehicle.make} <span className="text-[#ccc] mx-1">&gt;</span> {vehicle.yearModel.split('/')[0]}
                    </div>

                    <div className="flex justify-between items-end flex-wrap gap-3">
                        <div className="flex flex-col">
                            <h1 className="text-xl sm:text-2xl md:text-4xl m-0 text-[#333] flex items-center gap-2 font-extrabold uppercase tracking-tight">
                                <button className="bg-none border-none text-xl sm:text-2xl cursor-pointer text-[#666] flex items-center hover:text-[#333] transition-colors" onClick={() => navigate(-1)}>
                                    <FaChevronLeft />
                                </button>
                                {vehicle.make}
                            </h1>
                            <span className="text-base sm:text-xl md:text-2xl text-[#444] font-medium ml-7 sm:ml-8">{vehicle.model} {vehicle.version}</span>
                        </div>
                        <div className="text-base sm:text-xl font-bold text-[#666]">
                            {vehicle.yearModel}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 px-2 sm:px-4">
                    <div className="flex-[2]">
                        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6 bg-white p-4 sm:p-6 rounded-lg shadow-sm">
                            <div className="flex flex-col items-center text-center text-[#555] text-xs sm:text-sm">
                                <FaCalendarAlt className="text-xl sm:text-2xl mb-1.5 text-[#2ABB9B]" />
                                <span>{vehicle.yearModel}</span>
                            </div>
                            <div className="flex flex-col items-center text-center text-[#555] text-xs sm:text-sm">
                                <FaCogs className="text-xl sm:text-2xl mb-1.5 text-[#2ABB9B]" />
                                <span>{vehicle.transmission || 'Automático'}</span>
                            </div>
                            <div className="flex flex-col items-center text-center text-[#555] text-xs sm:text-sm">
                                <FaTachometerAlt className="text-xl sm:text-2xl mb-1.5 text-[#2ABB9B]" />
                                <span>{vehicle.mileage.toLocaleString()} km</span>
                            </div>
                            <div className="flex flex-col items-center text-center text-[#555] text-xs sm:text-sm">
                                <FaGasPump className="text-xl sm:text-2xl mb-1.5 text-[#2ABB9B]" />
                                <span>{vehicle.fuel || 'Flex'}</span>
                            </div>
                            <div className="flex flex-col items-center text-center text-[#555] text-xs sm:text-sm">
                                <FaPalette className="text-xl sm:text-2xl mb-1.5 text-[#2ABB9B]" />
                                <span>{vehicle.color || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col items-center text-center text-[#555] text-xs sm:text-sm">
                                <FaBarcode className="text-xl sm:text-2xl mb-1.5 text-[#2ABB9B]" />
                                <span>{vehicle.plate || 'Final ?'}</span>
                            </div>
                        </div>

                        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm mb-6">
                            <h3 className="text-lg sm:text-xl font-bold mb-3 text-[#333] border-b-2 border-gray-100 pb-2">Opcionais</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {vehicle.options && vehicle.options.length > 0 ? (
                                    vehicle.options.map((opt, idx) => (
                                        <div key={idx} className="text-[#666] text-sm flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-[#2ABB9B] rounded-full flex-shrink-0"></span>
                                            {opt}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-[#666] text-sm">Sem opcionais cadastrados.</div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm mb-6">
                            <h3 className="text-lg sm:text-xl font-bold mb-3 text-[#333] border-b-2 border-gray-100 pb-2">Observações</h3>
                            <p className="text-[#666] text-sm leading-relaxed">{vehicle.description || 'Nenhuma observação adicional.'}</p>
                        </div>

                        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm mb-6">
                            <h3 className="text-lg sm:text-xl font-bold mb-3 text-[#333] border-b-2 border-gray-100 pb-2">Procedência e Histórico</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-[#888] uppercase font-bold">Origem:</span>
                                    <span className="text-sm sm:text-base text-[#333] flex items-center gap-2 font-medium">
                                        {vehicle.originType === 'nacional' ? '🇧🇷 Nacional' : `🚢 Importado (${vehicle.originCountry})`}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-[#888] uppercase font-bold">Primeiro Dono:</span>
                                    <span className="text-sm sm:text-base text-[#333] flex items-center gap-2 font-medium">
                                        {vehicle.firstOwner ? <><FaCheckCircle className="text-[#2ABB9B]" /> Sim</> : <><FaInfoCircle className="text-[#3498db]" /> Não</>}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-[#888] uppercase font-bold">Documentação:</span>
                                    <span className={`text-sm sm:text-base flex items-center gap-2 font-medium ${
                                        vehicle.documentationStatus === 'regular' ? 'text-[#2ABB9B]' :
                                        vehicle.documentationStatus === 'pendente' ? 'text-[#f39c12]' :
                                        'text-[#e74c3c]'
                                    }`}>
                                        {vehicle.documentationStatus === 'regular' ? <><FaCheckCircle /> Regular</> :
                                            vehicle.documentationStatus === 'pendente' ? <><FaExclamationTriangle /> Pendente</> :
                                                <><FaExclamationTriangle /> Irregular</>}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-[#888] uppercase font-bold">IPVA:</span>
                                    <span className="text-sm sm:text-base text-[#333] flex items-center gap-2 font-medium">
                                        {vehicle.ipvaPaid ? <><FaCheckCircle className="text-[#2ABB9B]" /> Pago ({vehicle.ipvaYear})</> : <><FaExclamationTriangle className="text-[#f39c12]" /> Pendente</>}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-[#888] uppercase font-bold">Garantia:</span>
                                    <span className="text-sm sm:text-base text-[#333] flex items-center gap-2 font-medium">
                                        {vehicle.warranty ? <><FaShieldAlt className="text-[#2ABB9B]" /> Ativa</> : <><FaInfoCircle className="text-[#3498db]" /> Não possui</>}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-[#888] uppercase font-bold">Leilão:</span>
                                    <span className={`text-sm sm:text-base flex items-center gap-2 font-medium ${vehicle.fromAuction ? 'text-[#f39c12]' : 'text-[#2ABB9B]'}`}>
                                        {vehicle.fromAuction ? <><FaGavel /> Sim (Passagem por Leilão)</> : <><FaCheckCircle /> Não (Sem passagem por Leilão)</>}
                                    </span>
                                </div>
                            </div>

                            {(vehicle.fromAuction || vehicle.accidentHistory || vehicle.documentationNotes || vehicle.warrantyDetails) && (
                                <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-100 flex flex-col gap-3">
                                    {vehicle.fromAuction && vehicle.auctionDetails && (
                                        <div className="text-xs sm:text-sm text-[#555] leading-relaxed">
                                            <strong>Detalhes do Leilão:</strong> {vehicle.auctionDetails}
                                        </div>
                                    )}
                                    {vehicle.accidentHistory && (
                                        <div className="bg-[#fff9e6] p-3 rounded border-l-4 border-[#f39c12] flex items-center gap-3 text-[#856404] text-xs sm:text-sm">
                                            <FaExclamationTriangle /> <span><strong>Histórico de Sinistro:</strong> {vehicle.accidentDetails || 'Possui passagem por sinistro.'}</span>
                                        </div>
                                    )}
                                    {vehicle.documentationNotes && (
                                        <div className="text-xs sm:text-sm text-[#555] leading-relaxed">
                                            <strong>Obs. Documentação:</strong> {vehicle.documentationNotes}
                                        </div>
                                    )}
                                    {vehicle.warrantyDetails && (
                                        <div className="text-xs sm:text-sm text-[#555] leading-relaxed">
                                            <strong>Detalhes da Garantia:</strong> {vehicle.warrantyDetails}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="bg-white p-5 sm:p-8 rounded-lg shadow-lg sticky top-5">
                            <span className="block text-3xl sm:text-4xl lg:text-5xl font-black text-[#333] mb-4 sm:mb-6 text-center tracking-tight">
                                R$ {vehicle.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>

                            <form className="flex flex-col gap-3" onSubmit={handleLeadSubmit}>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Nome"
                                    className="w-full p-2.5 sm:p-3 border border-gray-200 rounded text-sm focus:border-[#2ABB9B] focus:ring-1 focus:ring-[#2ABB9B] focus:outline-none transition-all"
                                    value={leadFormData.name}
                                    onChange={handleLeadChange}
                                    required
                                />
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Celular"
                                    className="w-full p-2.5 sm:p-3 border border-gray-200 rounded text-sm focus:border-[#2ABB9B] focus:ring-1 focus:ring-[#2ABB9B] focus:outline-none transition-all"
                                    value={leadFormData.phone}
                                    onChange={handleLeadChange}
                                    required
                                />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="E-mail"
                                    className="w-full p-2.5 sm:p-3 border border-gray-200 rounded text-sm focus:border-[#2ABB9B] focus:ring-1 focus:ring-[#2ABB9B] focus:outline-none transition-all"
                                    value={leadFormData.email}
                                    onChange={handleLeadChange}
                                />
                                <textarea
                                    name="message"
                                    placeholder="Digite a sua mensagem"
                                    className="w-full p-2.5 sm:p-3 border border-gray-200 rounded text-sm min-h-[80px] resize-y focus:border-[#2ABB9B] focus:ring-1 focus:ring-[#2ABB9B] focus:outline-none transition-all"
                                    value={leadFormData.message}
                                    onChange={handleLeadChange}
                                ></textarea>

                                <div className="flex flex-col gap-2 text-xs sm:text-sm text-[#666]">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            name="simulateFinancing"
                                            className="w-4 h-4 accent-[#2ABB9B] cursor-pointer"
                                            checked={leadFormData.simulateFinancing}
                                            onChange={handleLeadChange}
                                        />
                                        Simular financiamento online
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    className="bg-[#2ABB9B] text-white font-bold p-3 sm:p-4 rounded text-sm sm:text-base cursor-pointer transition-colors hover:bg-[#24a085] mt-1 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform active:scale-[0.99]"
                                    disabled={sendingLead}
                                >
                                    {sendingLead ? 'Enviando...' : 'QUERO VER O CARRO'}
                                </button>
                            </form>

                            <div className="mt-6 text-center pt-4 border-t border-gray-100 text-[#777]">
                                <p className="font-bold text-[#333] mb-1.5 text-sm sm:text-base">Unidade Marília - SP</p>
                                <p className="text-sm">Dúvidas? Ligue para (14) 99705-0679</p>
                                <p className="text-xs mt-2 text-gray-400">
                                    Ao clicar em Enviar você aceita nossos termos e condições.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Image Lightbox */}
            <ImageLightbox
                images={vehicle.images || []}
                initialIndex={lightboxIndex}
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                altPrefix={`${vehicle.make} ${vehicle.model}`}
            />
        </div>
    );
};
