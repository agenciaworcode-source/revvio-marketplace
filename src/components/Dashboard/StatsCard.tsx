import React from 'react';
import './StatsCard.css';
import type { IconType } from 'react-icons';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon?: IconType;
    color?: string; // hex color for the status dot
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color }) => {
    return (
        <div className="stats-card">
            <div className="stats-header">
                <span className="stats-title">{title}</span>
                {Icon && <Icon className="stats-icon" style={{ color: '#2ABB9B' }} />}
                {color && <div className="stats-dot" style={{ backgroundColor: color }}></div>}
            </div>
            <div className="stats-value">{value}</div>
        </div>
    );
};
