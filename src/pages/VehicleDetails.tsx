import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vehicleService } from '../services/vehicleService';
import { type Vehicle } from '../data';
import { Header } from '../components/Header';
import {
    FaChevronLeft, FaChevronRight, FaCalendarAlt, FaCogs,
    FaTachometerAlt, FaGasPump, FaPalette, FaBarcode, FaSpinner
} from 'react-icons/fa';
import { toast } from 'sonner';
import './VehicleDetails.css';

export const VehicleDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);

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

    if (loading) {
        return (
            <div className="vehicle-details-page">
                <Header />
                <div className="container loading-container">
                    <FaSpinner className="loading-spinner" />
                    <h2>Carregando detalhes...</h2>
                </div>
            </div>
        );
    }

    if (!vehicle || vehicle.status === 'pending') {
        return (
            <div className="vehicle-details-page">
                <Header />
                <div className="container" style={{ padding: '50px', textAlign: 'center' }}>
                    <h2>Veículo não encontrado</h2>
                    <button onClick={() => navigate('/')}>Voltar para Home</button>
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
                <div className="gallery-slide" style={{ left: '0%', width: '100%' }}>
                    <img src={'https://via.placeholder.com/800x400?text=Sem+Imagem'} alt="Sem Imagem" />
                </div>
            );
        }

        const slides = [];
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
                    className="gallery-slide"
                    style={{ left: `${i * (100 / 3)}%` }}
                    onClick={() => setCurrentSlide(i)}
                >
                    <img src={img} alt={`${vehicle.model} - ${imgIndex + 1}`} />
                    {vehicle.isArmored && <div className="gallery-armored-badge">Blindado</div>}
                </div>
            );
        }
        return slides;
    };

    return (
        <div className="vehicle-details-page">
            <Header />

            <div className="vehicle-gallery-container">
                <button className="gallery-nav-btn gallery-prev" onClick={prevSlide}><FaChevronLeft /></button>

                <div className="gallery-viewport">
                    <div
                        className="gallery-track"
                        style={{ transform: `translateX(-${currentSlide * (100 / 3)}%)` }}
                    >
                        {renderSlides()}
                    </div>
                </div>

                <button className="gallery-nav-btn gallery-next" onClick={nextSlide}><FaChevronRight /></button>
            </div>

            <main className="container">
                <div className="vehicle-header-section">
                    <div className="breadcrumb">
                        Home <span>&gt;</span> Comprar <span>&gt;</span> {vehicle.make} <span>&gt;</span> {vehicle.yearModel.split('/')[0]}
                    </div>

                    <div className="vehicle-title-row">
                        <div className="title-left">
                            <h1 className="make-title">
                                <button className="back-btn" onClick={() => navigate(-1)}><FaChevronLeft /></button>
                                {vehicle.make}
                            </h1>
                            <span className="model-subtitle">{vehicle.model} {vehicle.version}</span>
                        </div>
                        <div className="year-badge-top">
                            {vehicle.yearModel}
                        </div>
                    </div>
                </div>

                <div className="details-container">
                    <div className="details-left">
                        <div className="specs-grid">
                            <div className="spec-item">
                                <FaCalendarAlt className="spec-icon" />
                                <span>{vehicle.yearModel}</span>
                            </div>
                            <div className="spec-item">
                                <FaCogs className="spec-icon" />
                                <span>{vehicle.transmission || 'Automático'}</span>
                            </div>
                            <div className="spec-item">
                                <FaTachometerAlt className="spec-icon" />
                                <span>{vehicle.mileage.toLocaleString()} km</span>
                            </div>
                            <div className="spec-item">
                                <FaGasPump className="spec-icon" />
                                <span>{vehicle.fuel || 'Flex'}</span>
                            </div>
                            <div className="spec-item">
                                <FaPalette className="spec-icon" />
                                <span>{vehicle.color || 'N/A'}</span>
                            </div>
                            <div className="spec-item">
                                <FaBarcode className="spec-icon" />
                                <span>{vehicle.plate || 'Final ?'}</span>
                            </div>
                        </div>

                        <div className="options-box">
                            <h3 className="section-title">Opcionais</h3>
                            <div className="options-list">
                                {vehicle.options && vehicle.options.length > 0 ? (
                                    vehicle.options.map((opt, idx) => (
                                        <div key={idx} className="option-item">{opt}</div>
                                    ))
                                ) : (
                                    <div className="option-item">Sem opcionais cadastrados.</div>
                                )}
                            </div>
                        </div>

                        <div className="observations-box">
                            <h3 className="section-title">Observações</h3>
                            <p>{vehicle.description || 'Nenhuma observação adicional.'}</p>
                        </div>
                    </div>

                    <div className="details-right">
                        <div className="price-box">
                            <span className="vehicle-price-large">
                                R$ {vehicle.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>

                            <form className="contact-form" onSubmit={handleLeadSubmit}>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Nome"
                                    className="contact-input"
                                    value={leadFormData.name}
                                    onChange={handleLeadChange}
                                    required
                                />
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Celular"
                                    className="contact-input"
                                    value={leadFormData.phone}
                                    onChange={handleLeadChange}
                                    required
                                />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="E-mail"
                                    className="contact-input"
                                    value={leadFormData.email}
                                    onChange={handleLeadChange}
                                />
                                <textarea
                                    name="message"
                                    placeholder="Digite a sua mensagem"
                                    className="contact-textarea"
                                    value={leadFormData.message}
                                    onChange={handleLeadChange}
                                ></textarea>

                                <div className="form-checks">
                                    <label className="check-label">
                                        <input
                                            type="checkbox"
                                            name="simulateFinancing"
                                            className="check-input"
                                            checked={leadFormData.simulateFinancing}
                                            onChange={handleLeadChange}
                                        />
                                        Simular financiamento online
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={sendingLead}
                                >
                                    {sendingLead ? 'Enviando...' : 'QUERO VER O CARRO'}
                                </button>
                            </form>

                            <div className="store-info">
                                <p className="store-name">Unidade Marília - SP</p>
                                <p>Dúvidas? Ligue para (14) 99705-0679</p>
                                <p style={{ fontSize: '0.7em', marginTop: '10px', color: '#999' }}>
                                    Ao clicar em Enviar você aceita nossos termos e condições.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
