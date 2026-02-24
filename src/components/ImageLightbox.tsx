import React, { useEffect, useState, useCallback, useRef } from 'react';
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';

interface ImageLightboxProps {
    images: string[];
    initialIndex: number;
    isOpen: boolean;
    onClose: () => void;
    altPrefix?: string;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
    images,
    initialIndex,
    isOpen,
    onClose,
    altPrefix = 'Foto'
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isAnimating, setIsAnimating] = useState(false);
    const touchStartRef = useRef<{ x: number; y: number } | null>(null);
    const touchDeltaRef = useRef(0);
    const [swipeOffset, setSwipeOffset] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen, initialIndex]);

    const goNext = useCallback(() => {
        if (isAnimating || images.length <= 1) return;
        setIsAnimating(true);
        setCurrentIndex(prev => (prev + 1) % images.length);
        setTimeout(() => setIsAnimating(false), 300);
    }, [images.length, isAnimating]);

    const goPrev = useCallback(() => {
        if (isAnimating || images.length <= 1) return;
        setIsAnimating(true);
        setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
        setTimeout(() => setIsAnimating(false), 300);
    }, [images.length, isAnimating]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') goNext();
            if (e.key === 'ArrowLeft') goPrev();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, goNext, goPrev]);

    // Touch/swipe handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartRef.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
        touchDeltaRef.current = 0;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!touchStartRef.current) return;
        const deltaX = e.touches[0].clientX - touchStartRef.current.x;
        touchDeltaRef.current = deltaX;
        setSwipeOffset(deltaX * 0.4);
    };

    const handleTouchEnd = () => {
        const threshold = 60;
        if (touchDeltaRef.current < -threshold) {
            goNext();
        } else if (touchDeltaRef.current > threshold) {
            goPrev();
        }
        setSwipeOffset(0);
        touchStartRef.current = null;
        touchDeltaRef.current = 0;
    };

    if (!isOpen || images.length === 0) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0, 0, 0, 0.92)',
                backdropFilter: 'blur(8px)',
                animation: 'lightboxFadeIn 0.25s ease-out'
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            {/* Close button */}
            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: 'white',
                    fontSize: 20,
                    cursor: 'pointer',
                    zIndex: 10,
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s',
                    backdropFilter: 'blur(4px)'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            >
                <FaTimes />
            </button>

            {/* Counter */}
            <div
                style={{
                    position: 'absolute',
                    top: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: 14,
                    fontWeight: 600,
                    letterSpacing: '1px',
                    background: 'rgba(0,0,0,0.4)',
                    padding: '6px 16px',
                    borderRadius: 20,
                    backdropFilter: 'blur(4px)'
                }}
            >
                {currentIndex + 1} / {images.length}
            </div>

            {/* Previous button */}
            {images.length > 1 && (
                <button
                    onClick={(e) => { e.stopPropagation(); goPrev(); }}
                    style={{
                        position: 'absolute',
                        left: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        color: 'white',
                        fontSize: 18,
                        cursor: 'pointer',
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        backdropFilter: 'blur(4px)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                        e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                    }}
                >
                    <FaChevronLeft />
                </button>
            )}

            {/* Image */}
            <div
                style={{
                    maxWidth: '90vw',
                    maxHeight: '85vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: `translateX(${swipeOffset}px)`,
                    transition: swipeOffset === 0 ? 'transform 0.3s ease' : 'none'
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <img
                    src={images[currentIndex]}
                    alt={`${altPrefix} ${currentIndex + 1}`}
                    style={{
                        maxWidth: '100%',
                        maxHeight: '85vh',
                        objectFit: 'contain',
                        borderRadius: 8,
                        userSelect: 'none',
                        animation: 'lightboxImgIn 0.3s ease-out'
                    }}
                    draggable={false}
                />
            </div>

            {/* Next button */}
            {images.length > 1 && (
                <button
                    onClick={(e) => { e.stopPropagation(); goNext(); }}
                    style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        color: 'white',
                        fontSize: 18,
                        cursor: 'pointer',
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        backdropFilter: 'blur(4px)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                        e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                    }}
                >
                    <FaChevronRight />
                </button>
            )}

            {/* Thumbnails */}
            {images.length > 1 && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: 16,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: 6,
                        maxWidth: '90vw',
                        overflowX: 'auto',
                        padding: '8px 12px',
                        background: 'rgba(0,0,0,0.4)',
                        borderRadius: 12,
                        backdropFilter: 'blur(4px)'
                    }}
                >
                    {images.map((img, idx) => (
                        <img
                            key={idx}
                            src={img}
                            alt={`Thumb ${idx + 1}`}
                            onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                            style={{
                                width: 52,
                                height: 38,
                                objectFit: 'cover',
                                borderRadius: 6,
                                cursor: 'pointer',
                                border: idx === currentIndex ? '2px solid #2ABB9B' : '2px solid transparent',
                                opacity: idx === currentIndex ? 1 : 0.5,
                                transition: 'all 0.2s',
                                flexShrink: 0
                            }}
                            draggable={false}
                        />
                    ))}
                </div>
            )}

            {/* Keyframes */}
            <style>{`
                @keyframes lightboxFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes lightboxImgIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};
