
import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaCar, FaUserTie, FaSignOutAlt } from 'react-icons/fa';
import './Sidebar.css';

export const Sidebar: React.FC = () => {
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <span className="logo-rev">REV</span>
                <span className="logo-vio">VIO</span>
            </div>

            <nav className="sidebar-nav">
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        `nav-item ${isActive && location.pathname === '/dashboard' ? 'active' : ''}`
                    }
                    end
                >
                    <FaCar className="nav-icon" />
                    <span>Veículos</span>
                </NavLink>

                <NavLink
                    to="/dashboard/owners"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <FaUserTie className="nav-icon" />
                    <span>Proprietários</span>
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <button className="logout-btn">
                    <FaSignOutAlt />
                    <span>Sair</span>
                </button>
            </div>
        </aside>
    );
};
