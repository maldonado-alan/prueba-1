// Ruta: src/app/dashboard/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useUserNFTs } from '@/hooks/useUserNFTs';
import NFTCard from '@/components/NFTCard';
import DebugPanel from '@/components/DebugPanel';

export default function Dashboard() {
    const { address, isConnected } = useAccount();
    const { nfts, isLoading, error, balance, refreshNfts } = useUserNFTs();
    const router = useRouter();
    
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isFirstLoad, setIsFirstLoad] = useState(true);

    useEffect(() => {
        if (isFirstLoad && !isLoading && nfts.length > 0) {
            setShowSuccessModal(true);
            setIsFirstLoad(false); // Evita que el modal aparezca cada vez que se refresca
        }
    }, [isLoading, nfts.length, isFirstLoad]);

    const handleStartCustomizing = () => {
        // --- ESTA ES LA CORRECCIÓN ---
        // 1. Cierra el modal
        setShowSuccessModal(false);
        // 2. Redirige al customizer del primer NFT encontrado
        if (nfts.length > 0) {
            router.push(`/customizer/${nfts[0].tokenId}`);
        }
    };
    
    return (
        <div className="min-h-screen bg-gradient-to-l from-[#000000] to-[#090746] text-white">
            <main className="max-w-7xl mx-auto p-6">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold">Selecciona tu NFT</h1>
                        <p className="text-gray-400">Elige el personaje que quieres modificar en el Wardrobe</p>
                        <p className="font-mono text-sm text-blue-400 mt-1">Wallet: {address}</p>
                    </div>
                    {/* Botones de acción */}
                </div>

                {/* Modal de éxito */}
                {showSuccessModal && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                        <div className="bg-gradient-to-br from-[#1322D3] to-[#090746] p-8 rounded-2xl text-center max-w-sm border border-blue-500/50">
                            <h2 className="text-2xl font-bold mb-2">¡NFTs Detectados!</h2>
                            <p className="text-blue-200 mb-4">Se encontraron {nfts.length} NFT en tu wallet.</p>
                            <div className="bg-black/30 p-3 rounded-lg mb-6">
                                <p className="text-sm">Wallet conectada:</p>
                                <p className="font-mono text-xs">{address}</p>
                            </div>
                            <p className="text-sm mb-6">Ahora puedes seleccionar cualquier NFT para personalizarlo en el Wardrobe.</p>
                            <button
                                onClick={handleStartCustomizing} // Usamos la nueva función
                                className="bg-white text-blue-600 px-6 py-3 rounded-xl w-full font-semibold hover:bg-gray-200 transition-colors"
                            >
                                ¡Empezar a Personalizar!
                            </button>
                        </div>
                    </div>
                )}

                {/* Estado de carga */}
                {isLoading && (
                     <div className="text-center">
                        <p>Detectando tus NFTs...</p>
                        <p className="text-sm text-gray-400">Balance detectado: {balance} NFTs</p>
                    </div>
                )}

                {/* Estado de error */}
                {error && !isLoading && (
                    <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg text-center">
                        <p className="font-bold">Error</p>
                        <p>{error}</p>
                        <button onClick={refreshNfts} className="mt-4 bg-red-500 px-4 py-2 rounded-lg">Intentar de nuevo</button>
                    </div>
                )}

                {/* NFTs encontrados */}
                {!isLoading && !error && nfts.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {nfts.map((nft) => (
                            <NFTCard key={nft.id} nft={nft} />
                        ))}
                    </div>
                )}
                
                {/* Sin NFTs */}
                {!isLoading && !error && nfts.length === 0 && (
                     <div className="text-center bg-black/30 p-8 rounded-lg">
                        <h3 className="text-xl font-bold">No se encontraron NFTs</h3>
                        <p className="text-gray-400">Esta wallet no tiene NFTs del contrato Primal.</p>
                     </div>
                )}
            </main>
            <DebugPanel />
        </div>
    );
}