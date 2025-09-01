import React, { useState } from 'react';
import { useAccount, useReadContracts } from 'wagmi';
import { erc721Abi } from 'viem';
import { CONTRACTS, SUPPORTED_NETWORKS } from '../config/contracts';

const NFT_CONTRACT_ADDRESS = CONTRACTS.PRIMACULT_NFT.address as `0x${string}`;

export default function NFTDebugger() {
  const { address, isConnected } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [manualTokenId, setManualTokenId] = useState('56');

  // Verificar balance
  const { data: balanceData, error: balanceError, isLoading: balanceLoading } = useReadContracts({
    contracts: [{ 
      address: NFT_CONTRACT_ADDRESS, 
      abi: erc721Abi, 
      functionName: 'balanceOf', 
      args: [address!] 
    }],
    query: { 
      enabled: isConnected && !!address,
    },
  });

  // Verificar owner de un token específico
  const { data: ownerData, error: ownerError } = useReadContracts({
    contracts: [{ 
      address: NFT_CONTRACT_ADDRESS, 
      abi: erc721Abi, 
      functionName: 'ownerOf', 
      args: [BigInt(manualTokenId)]
    }],
    query: { 
      enabled: isConnected && !!address && !!manualTokenId,
    },
  });

  const balance = balanceData ? Number(balanceData[0].result) : 0;
  const owner = ownerData ? ownerData[0].result : null;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold z-50"
      >
        🐛 Debug NFTs
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Debug de NFTs</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-sm">
          {/* Estado de conexión */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-white font-semibold mb-2">Estado de Conexión</h3>
            <div className="text-gray-300">
              <div>Conectado: {isConnected ? '✅ Sí' : '❌ No'}</div>
              <div>Address: {address || 'No disponible'}</div>
            </div>
          </div>

          {/* Balance */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-white font-semibold mb-2">Balance de NFTs</h3>
            <div className="text-gray-300">
              <div>Cargando: {balanceLoading ? '🔄 Sí' : '✅ No'}</div>
              <div>Balance: {balance} NFTs</div>
              {balanceError && (
                <div className="text-red-400 mt-2">
                  Error: {balanceError.message}
                </div>
              )}
            </div>
          </div>

          {/* Verificar NFT específico */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-white font-semibold mb-2">Verificar NFT #56</h3>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={manualTokenId}
                onChange={(e) => setManualTokenId(e.target.value)}
                placeholder="Token ID"
                className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              />
            </div>
            <div className="text-gray-300">
              <div>Owner del NFT #{manualTokenId}: {owner || 'Cargando...'}</div>
              <div>Tu address: {address}</div>
              <div className="mt-2">
                {owner && address ? (
                  owner.toLowerCase() === address.toLowerCase() ? (
                    <span className="text-green-400">✅ Eres el propietario</span>
                  ) : (
                    <span className="text-red-400">❌ No eres el propietario</span>
                  )
                ) : (
                  <span className="text-yellow-400">⏳ Verificando...</span>
                )}
              </div>
              {ownerError && (
                <div className="text-red-400 mt-2">
                  Error: {ownerError.message}
                </div>
              )}
            </div>
          </div>

                     {/* Información del contrato */}
           <div className="bg-gray-800 p-4 rounded-lg">
             <h3 className="text-white font-semibold mb-2">Información del Contrato</h3>
             <div className="text-gray-300">
               <div>Contrato: {NFT_CONTRACT_ADDRESS}</div>
               <div>Red: {SUPPORTED_NETWORKS[CONTRACTS.PRIMACULT_NFT.chainId].name}</div>
               <div>Chain ID: {CONTRACTS.PRIMACULT_NFT.chainId}</div>
             </div>
           </div>

          {/* Acciones */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-white font-semibold mb-2">Acciones</h3>
            <div className="flex gap-2">
                             <button
                 onClick={() => window.open(`${SUPPORTED_NETWORKS[CONTRACTS.PRIMACULT_NFT.chainId].explorer}/token/${NFT_CONTRACT_ADDRESS}?a=${address}`, '_blank')}
                 className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white text-sm"
               >
                 Ver en Explorer
               </button>
               <button
                 onClick={() => window.open(`https://magiceden.io/item/ethereum/${NFT_CONTRACT_ADDRESS}/56`, '_blank')}
                 className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white text-sm"
               >
                 Ver en Magic Eden
               </button>
            </div>
          </div>

          {/* Logs */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-white font-semibold mb-2">Logs de Consola</h3>
            <div className="text-gray-300 text-xs">
              <div>Revisa la consola del navegador (F12) para ver logs detallados</div>
              <div className="mt-2">
                <button
                  onClick={() => {
                    console.log('🔍 Debug manual:', {
                      address,
                      isConnected,
                      contractAddress: NFT_CONTRACT_ADDRESS,
                      balance,
                      balanceLoading,
                      balanceError: balanceError?.message,
                      owner,
                      ownerError: ownerError?.message
                    });
                  }}
                  className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-white text-xs"
                >
                  Log Manual
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
