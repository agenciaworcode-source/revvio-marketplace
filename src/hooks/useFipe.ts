import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3001/api';

interface FipeBrand {
    codigo: string;
    nome: string;
}

interface FipeModel {
    codigo: number;
    nome: string;
}

interface FipeYear {
    codigo: string;
    nome: string;
}

interface FipePrice {
    Valor: string;
    Marca: string;
    Modelo: string;
    AnoModelo: number;
    Combustivel: string;
    CodigoFipe: string;
    MesReferencia: string;
    TipoVeiculo: number;
    SiglaCombustivel: string;
}

export const useFipe = () => {
    const [brands, setBrands] = useState<FipeBrand[]>([]);
    const [models, setModels] = useState<FipeModel[]>([]);
    const [years, setYears] = useState<FipeYear[]>([]);
    const [priceData, setPriceData] = useState<FipePrice | null>(null);

    const [selectedBrand, setSelectedBrand] = useState<string>('');
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [selectedYear, setSelectedYear] = useState<string>('');

    const [loadingBrands, setLoadingBrands] = useState(false);
    const [loadingModels, setLoadingModels] = useState(false);
    const [loadingYears, setLoadingYears] = useState(false);
    const [loadingPrice, setLoadingPrice] = useState(false);

    // Buscar marcas ao montar o componente
    useEffect(() => {
        const fetchBrands = async () => {
            setLoadingBrands(true);
            try {
                const response = await fetch(`${API_URL}/fipe/brands`);
                const data = await response.json();
                setBrands(data);
            } catch (error) {
                console.error('Erro ao buscar marcas FIPE:', error);
            } finally {
                setLoadingBrands(false);
            }
        };
        fetchBrands();
    }, []);

    // Buscar modelos quando a marca for selecionada
    useEffect(() => {
        if (!selectedBrand) {
            setModels([]);
            setSelectedModel('');
            return;
        }

        const fetchModels = async () => {
            setLoadingModels(true);
            try {
                const response = await fetch(`${API_URL}/fipe/brands/${selectedBrand}/models`);
                const data = await response.json();
                setModels(data.modelos || []);
            } catch (error) {
                console.error('Erro ao buscar modelos FIPE:', error);
            } finally {
                setLoadingModels(false);
            }
        };
        fetchModels();
    }, [selectedBrand]);

    // Buscar anos quando o modelo for selecionado
    useEffect(() => {
        if (!selectedBrand || !selectedModel) {
            setYears([]);
            setSelectedYear('');
            return;
        }

        const fetchYears = async () => {
            setLoadingYears(true);
            try {
                const response = await fetch(`${API_URL}/fipe/brands/${selectedBrand}/models/${selectedModel}/years`);
                const data = await response.json();
                setYears(data);
            } catch (error) {
                console.error('Erro ao buscar anos FIPE:', error);
            } finally {
                setLoadingYears(false);
            }
        };
        fetchYears();
    }, [selectedBrand, selectedModel]);

    // Buscar preço quando o ano for selecionado
    useEffect(() => {
        if (!selectedBrand || !selectedModel || !selectedYear) {
            setPriceData(null);
            return;
        }

        const fetchPrice = async () => {
            setLoadingPrice(true);
            try {
                const response = await fetch(
                    `${API_URL}/fipe/brands/${selectedBrand}/models/${selectedModel}/years/${selectedYear}/price`
                );
                const data = await response.json();
                setPriceData(data);
            } catch (error) {
                console.error('Erro ao buscar preço FIPE:', error);
            } finally {
                setLoadingPrice(false);
            }
        };
        fetchPrice();
    }, [selectedBrand, selectedModel, selectedYear]);

    const reset = () => {
        setSelectedBrand('');
        setSelectedModel('');
        setSelectedYear('');
        setModels([]);
        setYears([]);
        setPriceData(null);
    };

    return {
        brands,
        models,
        years,
        priceData,
        selectedBrand,
        selectedModel,
        selectedYear,
        setSelectedBrand,
        setSelectedModel,
        setSelectedYear,
        loadingBrands,
        loadingModels,
        loadingYears,
        loadingPrice,
        reset
    };
};
