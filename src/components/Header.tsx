import { Link } from 'react-router-dom';
import './Header.css';

export const Header: React.FC = () => {
    return (
        <header className="header">
            <div className="container header-content">
                <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
                    <img src="/assets/logo-icon.png" alt="Logo" className="h-8 w-auto" />
                    <div className="logo">
                        <span className="logo-rev">REV</span>
                        <span className="logo-vio">VIO</span>
                    </div>
                </Link>
                <div className="header-right">
                    {window.location.pathname.startsWith('/dashboard') && (
                        <span className="header-title">Gestão de Veículos</span>
                    )}
                </div>
            </div>
        </header>
    );
};

