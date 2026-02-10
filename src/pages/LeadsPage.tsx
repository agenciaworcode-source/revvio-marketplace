import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, User, Phone, MapPin, Calendar, Download, X } from 'lucide-react';

interface Lead {
    user_id: string;
    nome: string;
    contato: string;
    cidade: string;
    created_at: string;
    email?: string; // We might fetch this if we join with auth.users (harder in client) or just show leads data
}

export const LeadsPage: React.FC = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [cityFilter, setCityFilter] = useState('');

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLeads(data || []);
        } catch (error) {
            console.error('Erro ao buscar leads:', error);
        } finally {
            setLoading(false);
        }
    };

    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;

    const uniqueCities = Array.from(new Set(leads.map(lead => lead.cidade).filter(Boolean))).sort();

    const filteredLeads = leads
        .filter(lead => lead.email !== adminEmail)
        .filter(lead => 
            (lead.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (lead.cidade || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (lead.contato || '').includes(searchTerm)
        )
        .filter(lead => {
            if (!startDate && !endDate) return true;
            const leadDate = new Date(lead.created_at).toISOString().split('T')[0];
            if (startDate && leadDate < startDate) return false;
            if (endDate && leadDate > endDate) return false;
            return true;
        })
        .filter(lead => {
            if (!cityFilter) return true;
            return lead.cidade === cityFilter;
        });

    const handleExportCSV = () => {
        const headers = ['Nome', 'Email', 'Telefone', 'Cidade', 'Data de Criação'];
        const csvContent = [
            headers.join(';'),
            ...filteredLeads.map(lead => [
                `"${(lead.nome || '').replace(/"/g, '""')}"`,
                `"${(lead.email || '').replace(/"/g, '""')}"`,
                `"${(lead.contato || '').replace(/"/g, '""')}"`,
                `"${(lead.cidade || '').replace(/"/g, '""')}"`,
                `"${new Date(lead.created_at).toLocaleString('pt-BR')}"`
            ].join(';'))
        ].join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStartDate('');
        setEndDate('');
        setCityFilter('');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
                    <p className="text-slate-500 text-sm">Gerencie os usuários interessados nas ofertas.</p>
                </div>
                <button 
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 bg-[#2ABB9B] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#24a085] transition-colors"
                >
                    <Download className="w-4 h-4" />
                    Exportar CSV
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Buscar por nome, cidade ou telefone..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-[#2ABB9B] outline-none"
                        />
                    </div>
                    
                    <div className="flex gap-2">
                        <input 
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-[#2ABB9B] outline-none text-slate-600"
                            title="Data Inicial"
                        />
                        <span className="self-center text-slate-400">-</span>
                        <input 
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-[#2ABB9B] outline-none text-slate-600"
                            title="Data Final"
                        />
                    </div>

                    <select
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-[#2ABB9B] outline-none text-slate-600 min-w-[150px]"
                    >
                        <option value="">Todas as Cidades</option>
                        {uniqueCities.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>

                    {(searchTerm || startDate || endDate || cityFilter) && (
                        <button 
                            onClick={clearFilters}
                            className="px-4 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                        >
                            <X className="w-4 h-4" />
                            Limpar
                        </button>
                    )}
                </div>
            </div>

            {/* Grid of Leads */}
            {loading ? (
                 <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2ABB9B]"></div>
                 </div>
            ) : filteredLeads.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-slate-200 border-dashed">
                    <p className="text-slate-500">Nenhum lead encontrado.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredLeads.map((lead) => (
                        <div key={lead.user_id} className="bg-white rounded-lg border border-slate-200 p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                    <User className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-slate-900 truncate">{lead.nome || 'Nome não informado'}</h3>
                                    <p className="text-xs text-slate-500 truncate">{lead.email}</p>
                                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                        <Calendar className="w-3 h-3" />
                                        {format(new Date(lead.created_at), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="space-y-2 text-sm text-slate-600">
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-slate-400" />
                                    <span>{lead.contato || 'Telefone não informado'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    <span>{lead.cidade || 'Cidade não informada'}</span>
                                </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                                {lead.contato ? (
                                    <a 
                                        href={`https://wa.me/55${lead.contato.replace(/\D/g, '')}`} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors"
                                    >
                                        WhatsApp
                                    </a>
                                ) : (
                                    <button 
                                        disabled
                                        className="flex-1 bg-slate-200 text-slate-400 text-xs font-bold py-2 px-4 rounded flex items-center justify-center gap-2 cursor-not-allowed"
                                    >
                                        Sem WhatsApp
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
