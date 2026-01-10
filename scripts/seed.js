import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const vehicles = [
    {
        make: 'VOLKSWAGEN',
        model: 'TIGUAN 2.0 TSI 16V TURBO',
        version: 'AUTOMÁTICO',
        year_model: '2012/2012',
        mileage: 145000,
        price: 53890,
        is_armored: false,
        image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=500&q=60',
        status: 'active',
        color: 'Branco',
        fuel: 'Gasolina',
        transmission: 'Automático',
        plate: 'Final 8',
        options: ['Airbag', 'Ar Condicionado', 'Freio ABS', 'Direção Hidráulica', 'Travas Elétricas', 'Vidros Elétricos', 'Alarme', 'Som', 'Sensor de Ré', 'Rodas de Liga Leve'],
        description: 'Chave Reserva, Manual do Proprietário, Pneus novos.'
    },
    {
        make: 'SUBARU',
        model: 'TRIBECA 3.6 LIMITED AWD V6',
        version: 'AUTOMÁTICO',
        year_model: '2010/2011',
        mileage: 130000,
        price: 49990,
        old_price: 52000,
        is_armored: true,
        image: 'https://images.unsplash.com/photo-1533473359331-0135ef1bcfb0?auto=format&fit=crop&w=500&q=60',
        status: 'reserved',
        color: 'Prata',
        fuel: 'Gasolina',
        transmission: 'Automático',
        plate: 'Final 2',
        options: ['Airbag', 'Ar Condicionado', 'Freio ABS', 'Direção Hidráulica', 'Travas Elétricas', 'Vidros Elétricos', 'Alarme', 'Som', 'Sensor de Ré', 'Rodas de Liga Leve', 'Teto Solar', 'Bancos em Couro'],
        description: 'Blindagem nível IIIA, documentação em dia.'
    },
    {
        make: 'KIA',
        model: 'SPORTAGE 2.0 LX 4X2 16V',
        version: 'AUTOMÁTICO',
        year_model: '2017/2018',
        mileage: 64653,
        price: 97900,
        old_price: 102900,
        is_armored: true,
        image: 'https://images.unsplash.com/photo-1580273916550-e323be2ebccd?auto=format&fit=crop&w=500&q=60',
        status: 'active',
        color: 'Branco',
        fuel: 'Flex',
        transmission: 'Automático',
        plate: 'Final 5',
        options: ['Airbag', 'Ar Condicionado', 'Freio ABS', 'Direção Hidráulica', 'Travas Elétricas', 'Vidros Elétricos', 'Alarme', 'Som', 'Sensor de Ré', 'Rodas de Liga Leve'],
        description: 'Único dono, todas revisões na concessionária.'
    },
    {
        make: 'VOLKSWAGEN',
        model: 'GOL 1.0 MI 8V',
        version: 'FLEX MANUAL',
        year_model: '2014/2015',
        mileage: 85000,
        price: 35000,
        is_armored: false,
        image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=500&q=60',
        status: 'sold',
        color: 'Azul',
        fuel: 'Flex',
        transmission: 'Manual',
        plate: 'Final 9',
        options: ['Ar Condicionado', 'Direção Hidráulica', 'Travas Elétricas'],
        description: 'Carro muito econômico, ótimo para o dia a dia.'
    },
    {
        make: 'HONDA',
        model: 'CITY 1.5 EXL CVT',
        version: 'AUTOMÁTICO',
        year_model: '2019/2020',
        mileage: 45000,
        price: 85000,
        is_armored: false,
        image: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=500&q=60',
        status: 'active',
        color: 'Amarelo',
        fuel: 'Flex',
        transmission: 'Automático',
        plate: 'Final 0',
        options: ['Airbag', 'Ar Condicionado', 'Freio ABS', 'Direção Hidráulica', 'Travas Elétricas', 'Vidros Elétricos', 'Alarme', 'Som', 'Sensor de Ré', 'Rodas de Liga Leve', 'Câmera de Ré', 'Multimídia'],
        description: 'Excelente estado de conservação.'
    },
    {
        make: 'JEEP',
        model: 'COMPASS 2.0 16V FLEX LONGITUDE',
        version: 'AUTOMÁTICO',
        year_model: '2018/2019',
        mileage: 55000,
        price: 115000,
        is_armored: false,
        image: 'https://images.unsplash.com/photo-1568844293986-8d04aad2b30e?auto=format&fit=crop&w=500&q=60',
        status: 'active',
        color: 'Branco',
        fuel: 'Flex',
        transmission: 'Automático',
        plate: 'Final 1',
        options: ['Airbag', 'Ar Condicionado', 'Freio ABS', 'Direção Hidráulica', 'Travas Elétricas', 'Vidros Elétricos', 'Alarme', 'Som', 'Sensor de Ré', 'Rodas de Liga Leve', 'Teto Solar Panorâmico', 'Start/Stop'],
        description: 'Veículo de não fumante, sem detalhes.'
    }
];

async function seed() {
    console.log('Start seeding...');
    const { data, error } = await supabase
        .from('vehicles')
        .insert(vehicles)
        .select();

    if (error) {
        console.error('Error seeding data:', error);
    } else {
        console.log('Data seeded successfully:', data.length, 'rows');
    }
}

seed();
