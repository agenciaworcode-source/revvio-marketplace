export interface Vehicle {
  id: number;
  make: string;
  model: string;
  version: string;
  yearModel: string; // e.g., 2012/2012
  mileage: number;
  price: number;
  oldPrice?: number;
  isArmored: boolean; // boolean for "Blindado"
  images: string[];
  location?: string;
  status?: 'active' | 'reserved' | 'sold' | 'pending';
  color?: string;
  fuel?: string;
  transmission?: string;
  plate?: string;
  options?: string[];
  description?: string;
  owner?: {
    name: string;
    phone: string;
    email?: string;
  };
}

export const defaultOptions = [
  'Airbag', 'Ar Condicionado', 'Freio ABS', 'Direção Hidráulica',
  'Travas Elétricas', 'Vidros Elétricos', 'Alarme', 'Som',
  'Sensor de Ré', 'Rodas de Liga Leve'
];
export const carBrands = [
  'Audi', 'BMW', 'Chery', 'Chevrolet', 'Citroën', 'Fiat', 'Ford', 'Honda',
  'Hyundai', 'Jeep', 'Kia', 'Land Rover', 'Mercedes-Benz', 'Mitsubishi',
  'Nissan', 'Peugeot', 'Porsche', 'Renault', 'Toyota', 'Volkswagen', 'Volvo'
];
