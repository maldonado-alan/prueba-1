// Archivo: src/hooks/useUserNFTs.ts (reemplazar todo)

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';

interface Nft {
    id: string;
    tokenId: string;
    imageUrl?: string;
    name?: string;
    metadata?: any;
}

export const useUserNFTs = () => {
    const { address, isConnected } = useAccount();
    const [nfts, setNfts] = useState<Nft[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchNFTs = useCallback(async (walletAddress: string) => {
        if (!walletAddress) return;

        setIsLoading(true);
        setError(null);

        try {
            // Llama a la nueva API que creamos
            const response = await fetch(`/api/get-user-nfts?address=${walletAddress}`);
            if (!response.ok) {
                throw new Error('Error al cargar los NFTs desde el servidor.');
            }
            const data = await response.json();
            setNfts(data.nfts || []);
            console.log(`✅ ${data.nfts.length} NFTs encontrados para ${walletAddress}`);

        } catch (err: any) {
            console.error("Error en fetchNFTs:", err);
            setError(err.message);
            setNfts([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isConnected && address) {
            fetchNFTs(address);
        } else {
            // Limpiar estado si el usuario se desconecta
            setNfts([]);
            setIsLoading(false);
            setError(null);
        }
    }, [address, isConnected, fetchNFTs]);

    const refreshNfts = useCallback(() => {
        if (address) {
            fetchNFTs(address);
        }
    }, [address, fetchNFTs]);

    return {
        nfts,
        isLoading,
        error,
        balance: nfts.length, // El balance es simplemente la cantidad de NFTs en el array
        refreshNfts,
        isConnected
    };
};