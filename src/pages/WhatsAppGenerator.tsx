import React, { useState, useEffect } from 'react';
import { useVehicles } from '../context/VehicleContext';
import { Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const WhatsAppGenerator: React.FC = () => {
    const { vehicles } = useVehicles();
    const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
    const [template, setTemplate] = useState('');
    const [copied, setCopied] = useState(false);

    const selectedVehicle = vehicles.find(v => v.id.toString() === selectedVehicleId);

    // Function to find FIPE Price automatically
    const fetchFipePrice = async (make: string, model: string, year: string) => {
        try {
            console.log(`Buscando FIPE para: ${make} - ${model} - ${year}`);
            
            // 1. Fetch Brands
            const brandsRes = await fetch(`${API_URL}/fipe/brands`);
            const brands = await brandsRes.json();
            const brand = brands.find((b: { nome: string }) => b.nome.toLowerCase() === make.toLowerCase());
            
            if (!brand) throw new Error('Marca não encontrada');

            // 2. Fetch Models
            const modelsRes = await fetch(`${API_URL}/fipe/brands/${brand.codigo}/models`);
            const modelsData = await modelsRes.json();
            const modelObj = modelsData.modelos.find((m: { nome: string }) => m.nome.toLowerCase() === model.toLowerCase());
            
            if (!modelObj) throw new Error('Modelo não encontrado');

            // 3. Fetch Years
            const yearsRes = await fetch(`${API_URL}/fipe/brands/${brand.codigo}/models/${modelObj.codigo}/years`);
            const years = await yearsRes.json();
            // Try to match year (e.g., "2015" in "2015-1")
            const yearObj = years.find((y: { nome: string }) => y.nome.includes(year.split('/')[0]));
            
            if (!yearObj) throw new Error('Ano não encontrado');

            // 4. Fetch Price
            const priceRes = await fetch(`${API_URL}/fipe/brands/${brand.codigo}/models/${modelObj.codigo}/years/${yearObj.codigo}/price`);
            const priceData = await priceRes.json();
            
            return priceData.Valor;
        } catch (error) {
            console.error('Erro ao buscar FIPE automática:', error);
            return null;
        }
    };

    useEffect(() => {
        if (!selectedVehicle) {
            setTemplate('');
            return;
        }

        const buildTemplate = async () => {
             // Format currency
            const formatCurrency = (val: number) => 
                val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace('R$', '').trim();

            let fipeLine = '';
            let priceLine = '';
            let fetchedFipe = '';

            // Calculate Price Logic
            if (selectedVehicle.belowFipe) {
                // Case: Below FIPE
                // Try to autofill FIPE
                setTemplate(prev => prev); // Keep previous interaction?? No, user expects regen.
                
                fetchedFipe = await fetchFipePrice(selectedVehicle.make, selectedVehicle.model, selectedVehicle.yearModel) || '';
                if (fetchedFipe) {
                    // Remove R$ if present to avoid double R$
                     fipeLine = `📈 FIPE: ${fetchedFipe}`;
                } else {
                     fipeLine = `📈 FIPE: R$ `;
                }

                priceLine = `📉 POR: R$ ${formatCurrency(selectedVehicle.price)}`;
            } else {
                // Case: Normal (Use Registration Price as FIPE line, empty POR)
                fipeLine = `📈 FIPE: R$ ${formatCurrency(selectedVehicle.price)}`;
                priceLine = `📉 POR: R$ `;
            }
            
            // Construct expenses/details
            const parts = [];
            if (selectedVehicle.description) parts.push(selectedVehicle.description);
            if (selectedVehicle.accidentDetails) parts.push(`Histórico: ${selectedVehicle.accidentDetails}`);
            if (selectedVehicle.documentationNotes) parts.push(`Doc: ${selectedVehicle.documentationNotes}`);
            const expensesText = parts.length > 0 ? parts.join('\n') : 'polimento, pinceis de uso, pequeno ralado para-lama traseiro.';

            // Build initial template
            const generated = `🚀 REVVIO MARÍLIA 🚀

🚗 ${selectedVehicle.make} ${selectedVehicle.model} ${selectedVehicle.version}
-- - - - - - - - - - -  - - - - - - - -
📅 ANO/MOD: ${selectedVehicle.yearModel}
🕧 KM: ${selectedVehicle.mileage.toLocaleString('pt-BR')}
⛽ COMBUSTIVEL: ${selectedVehicle.fuel || 'FLEX'}
🕹️ CÂMBIO: ${selectedVehicle.transmission || 'MANUAL'}   
🛞 PNEUS: ${selectedVehicle.tires || ''}
✅ CHAVE: ${selectedVehicle.keys || ''}
✅ IPVA ${new Date().getFullYear()}: ${selectedVehicle.ipvaPaid ? 'PAGO' : 'PENDENTE'}
🛠️ PARTE MECÂNICA 👇🏻
✅ MOTOR: ${selectedVehicle.engine || ''}
✅ CÂMBIO: ${selectedVehicle.transmissionState || ''}
✅ SUSPENSÃO: ${selectedVehicle.suspension || ''}
🥶 AR CONDICIONADO: ${selectedVehicle.airConditioning || ''}
 - - - - - - - - - - - - - - - - - - -
✅ OPCIONAIS: ${selectedVehicle.options && selectedVehicle.options.length > 0 ? selectedVehicle.options.join(', ') : 'Básico'}
 
🧰 GASTOS: ${expensesText} (OLHAR FOTOS)
▃▃▃▃▃▃▃▃▃▃▃▃▃▃ 
${fipeLine}
${priceLine}
🔥🔥🔥🔥🔥🔥🔥🔥🔥
 🚨CHAMA NA PROPOSTA🚨
▃▃▃▃▃▃▃▃▃▃▃▃▃▃`;

            setTemplate(generated);
        };

        buildTemplate();
    }, [selectedVehicleId]); 

    const handleCopy = () => {
        navigator.clipboard.writeText(template);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Gerador de Copy WhatsApp</h1>
                <p className="text-slate-500 text-sm">Selecione o veículo e edite o texto conforme necessário.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Editor</CardTitle>
                    <CardDescription>
                        Selecione um veículo para carregar os dados. O texto é totalmente editável.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Veículo</label>
                        <select 
                            className="w-full p-2 bg-white border border-slate-200 rounded-md"
                            value={selectedVehicleId}
                            onChange={(e) => setSelectedVehicleId(e.target.value)}
                        >
                            <option value="">Selecione um carro...</option>
                            {vehicles.map(v => (
                                <option key={v.id} value={v.id}>
                                    {v.make} {v.model} - {v.yearModel}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Texto do Anúncio</label>
                        <Textarea 
                            value={template}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTemplate(e.target.value)}
                            className="font-mono text-sm min-h-[500px]"
                            placeholder="Selecione um veículo para gerar o texto..."
                        />
                    </div>

                    <Button 
                        className="w-full gap-2 bg-[#2ABB9B] hover:bg-[#24a085]"
                        onClick={handleCopy}
                        disabled={!template}
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copiado!' : 'Copiar Texto'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};
