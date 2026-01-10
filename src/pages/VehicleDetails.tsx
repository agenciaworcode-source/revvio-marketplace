import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vehicleService } from '../services/vehicleService';
import { type Vehicle } from '../data';
import { Header } from '../components/Header';
import {
    FaChevronLeft, FaChevronRight, FaCalendarAlt, FaCogs,
    FaTachometerAlt, FaGasPump, FaPalette, FaBarcode, FaSpinner
} from 'react-icons/fa';
import './VehicleDetails.css';

export const VehicleDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);

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

    // Helper to render visible slides for infinite effect
    const renderSlides = () => {
        if (!vehicle?.images || vehicle.images.length === 0) {
            return (
                <div className="gallery-slide" style={{ left: '0%', width: '100%' }}>
                    <img src={'https://via.placeholder.com/800x400?text=Sem+Imagem'} alt="Sem Imagem" />
                </div>
            );
        }

        const slides = [];
        // Determine window of slides to render. 
        // We show 3 images. Let's render from current-2 to current+5 to ensure smooth transition buffer.
        const buffer = 2;
        const visibleCount = 3;
        const start = currentSlide - buffer;
        const end = currentSlide + visibleCount + buffer;

        for (let i = start; i <= end; i++) {
            // Modulo logic to loop correctly
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

            {/* Gallery / Hero */}
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
                {/* Breadcrumb & Title */}
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
                    {/* Left Column: Specs & Options */}
                    <div className="details-left">
                        {/* Icons Grid */}
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

                        {/* Options */}
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

                        {/* Observations */}
                        <div className="observations-box">
                            <h3 className="section-title">Observações</h3>
                            <p>{vehicle.description || 'Nenhuma observação adicional.'}</p>
                        </div>
                    </div>

                    {/* Right Column: Price & Form */}
                    <div className="details-right">
                        <div className="price-box">
                            <span className="vehicle-price-large">
                                R$ {vehicle.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>

                            <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
                                <input type="text" placeholder="Nome" className="contact-input" />
                                <input type="tel" placeholder="Celular" className="contact-input" />
                                <input type="email" placeholder="E-mail" className="contact-input" />
                                <textarea placeholder="Digite a sua mensagem" className="contact-textarea"></textarea>

                                <div className="form-checks">
                                    <label className="check-label">
                                        <input type="checkbox" className="check-input" />
                                        Solicitar cotação de seguro
                                    </label>
                                    <label className="check-label">
                                        <input type="checkbox" className="check-input" />
                                        Simular financiamento online
                                    </label>
                                </div>

                                <button type="submit" className="submit-btn" onClick={() => alert('Mensagem enviada com sucesso!')}>
                                    QUERO VER O CARRO
                                </button>
                            </form>

                            <div className="store-info">
                                <p className="store-name">Unidade Morumbi</p>
                                <p>Dúvidas? Ligue para (11) 5629-2000</p>
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
