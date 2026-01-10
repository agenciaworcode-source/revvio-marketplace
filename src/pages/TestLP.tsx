import React, { useState } from 'react';
import { vehicleService } from '../services/vehicleService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const TestLP: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSimulateSubmit = async () => {
        setStatus('loading');
        try {
            const dummyVehicle = {
                make: 'Toyota (Teste LP)',
                model: 'Corolla',
                version: 'XEI 2.0',
                yearModel: '2022/2023',
                mileage: 15000,
                price: 135000,
                isArmored: false,
                images: ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80&w=800'],
                location: 'São Paulo - SP',
                owner: {
                    name: 'Testador Silva',
                    phone: '11988887777',
                    email: 'teste@exemplo.com'
                }
            };

            await vehicleService.submitFromLP(dummyVehicle);
            setStatus('success');
            setMessage('Veículo cadastrado com sucesso como PENDENTE!');
        } catch (error: any) {
            console.error(error);
            setStatus('error');
            setMessage(error.message || 'Erro ao cadastrar veículo');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
            <Card className="max-w-md w-full">
                <CardHeader>
                    <CardTitle>Simulador de Landing Page</CardTitle>
                    <CardDescription>
                        Clique no botão abaixo para simular o envio de um formulário de cadastro de veículo.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {status === 'success' && (
                        <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="text-sm font-medium">{message}</span>
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md border border-destructive/20">
                            <AlertCircle className="w-5 h-5" />
                            <span className="text-sm font-medium">{message}</span>
                        </div>
                    )}

                    <Button
                        onClick={handleSimulateSubmit}
                        className="w-full"
                        disabled={status === 'loading'}
                    >
                        {status === 'loading' ? 'Enviando...' : 'Simular Envio de Formulário'}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                        Nota: Isso enviará um veículo com status "pending" para o banco de dados.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};
