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
    async getBrands(type: string = 'carros') {
        const cacheKey = `brands-${type}`;
        const cached = getCached(cacheKey);
        if (cached) return cached;

        const response = await fetch(`${FIPE_BASE_URL}/${type}/marcas`);
        if (!response.ok) throw new Error(`Falha ao buscar marcas de ${type} da FIPE`);

        const data = await response.json();
        setCache(cacheKey, data);
        return data;
    },

    async getModels(type: string = 'carros', brandCode: string) {
        const cacheKey = `models-${type}-${brandCode}`;
        const cached = getCached(cacheKey);
        if (cached) return cached;

        const response = await fetch(`${FIPE_BASE_URL}/${type}/marcas/${brandCode}/modelos`);
        if (!response.ok) throw new Error(`Falha ao buscar modelos de ${type} da FIPE`);

        const data = await response.json();
        setCache(cacheKey, data);
        return data;
    },

    async getYears(type: string = 'carros', brandCode: string, modelCode: string) {
        const cacheKey = `years-${type}-${brandCode}-${modelCode}`;
        const cached = getCached(cacheKey);
        if (cached) return cached;

        const response = await fetch(`${FIPE_BASE_URL}/${type}/marcas/${brandCode}/modelos/${modelCode}/anos`);
        if (!response.ok) throw new Error(`Falha ao buscar anos de ${type} da FIPE`);

        const data = await response.json();
        setCache(cacheKey, data);
        return data;
    },

    async getPrice(type: string = 'carros', brandCode: string, modelCode: string, yearCode: string) {
        const response = await fetch(
            `${FIPE_BASE_URL}/${type}/marcas/${brandCode}/modelos/${modelCode}/anos/${yearCode}`
        );
        if (!response.ok) throw new Error(`Falha ao buscar preço de ${type} da FIPE`);

        const data = await response.json();
        return data;
    }
};
