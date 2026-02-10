const FIPE_BASE_URL = 'https://parallelum.com.br/fipe/api/v1';

// Cache simples em memória (válido por 24h)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

const getCached = (key: string) => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    return null;
};

const setCache = (key: string, data: any) => {
    cache.set(key, { data, timestamp: Date.now() });
};

export const fipeService = {
    async getBrands() {
        const cacheKey = 'brands';
        const cached = getCached(cacheKey);
        if (cached) return cached;

        const response = await fetch(`${FIPE_BASE_URL}/carros/marcas`);
        if (!response.ok) throw new Error('Falha ao buscar marcas da FIPE');

        const data = await response.json();
        setCache(cacheKey, data);
        return data;
    },

    async getModels(brandCode: string) {
        const cacheKey = `models-${brandCode}`;
        const cached = getCached(cacheKey);
        if (cached) return cached;

        const response = await fetch(`${FIPE_BASE_URL}/carros/marcas/${brandCode}/modelos`);
        if (!response.ok) throw new Error('Falha ao buscar modelos da FIPE');

        const data = await response.json();
        setCache(cacheKey, data);
        return data;
    },

    async getYears(brandCode: string, modelCode: string) {
        const cacheKey = `years-${brandCode}-${modelCode}`;
        const cached = getCached(cacheKey);
        if (cached) return cached;

        const response = await fetch(`${FIPE_BASE_URL}/carros/marcas/${brandCode}/modelos/${modelCode}/anos`);
        if (!response.ok) throw new Error('Falha ao buscar anos da FIPE');

        const data = await response.json();
        setCache(cacheKey, data);
        return data;
    },

    async getPrice(brandCode: string, modelCode: string, yearCode: string) {
        const response = await fetch(
            `${FIPE_BASE_URL}/carros/marcas/${brandCode}/modelos/${modelCode}/anos/${yearCode}`
        );
        if (!response.ok) throw new Error('Falha ao buscar preço da FIPE');

        const data = await response.json();
        return data;
    }
};
