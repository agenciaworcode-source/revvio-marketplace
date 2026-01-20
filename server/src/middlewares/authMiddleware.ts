import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase.js';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Verificando o token com o Supabase
            const { data: { user }, error } = await supabase.auth.getUser(token);

            if (error || !user) {
                res.status(401);
                throw new Error('Not authorized, token failed');
            }

            // Adicionando o usuário ao request para uso posterior
            (req as any).user = user;
            next();
        } catch (error) {
            res.status(401);
            next(new Error('Not authorized, token failed'));
        }
    }

    if (!token) {
        res.status(401);
        next(new Error('Not authorized, no token'));
    }
};
