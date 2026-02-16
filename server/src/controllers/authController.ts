import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, nome, contato, cidade } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
        }

        // Create user with explicit email confirmation using admin API
        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm the email
            user_metadata: {
                nome,
                contato,
                cidade
            }
        });

        if (error) {
            console.error('Erro ao criar usuário:', error);
            if (error.message.includes('already registered')) {
                return res.status(409).json({ message: 'Este email já está cadastrado.' });
            }
            throw error;
        }

        if (!data.user) {
            throw new Error('Falha ao criar usuário.');
        }

        res.status(201).json({ 
            message: 'Usuário criado com sucesso.', 
            user: {
                id: data.user.id,
                email: data.user.email,
                metadata: data.user.user_metadata
            }
        });

    } catch (error: any) {
        console.error('Erro no registro:', error);
        res.status(500).json({ message: error.message || 'Erro interno no servidor.' });
    }
};
