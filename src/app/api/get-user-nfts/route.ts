// Ruta: src/app/api/get-user-nfts/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { CONTRACTS, SUPPORTED_NETWORKS } from '@/config/contracts';

interface Nft {
    id: string;
    tokenId: string;
    name: string;
    imageUrl: string;
}

const NFT_CONTRACT_ADDRESS = CONTRACTS.PRIMACULT_NFT.address as `0x${string}`;

const APECHAIN_CONFIG = {
    id: CONTRACTS.PRIMACULT_NFT.chainId,
    name: SUPPORTED_NETWORKS[CONTRACTS.PRIMACULT_NFT.chainId].name,
    network: 'apechain',
    nativeCurrency: {
        name: SUPPORTED_NETWORKS[CONTRACTS.PRIMACULT_NFT.chainId].currency,
        symbol: SUPPORTED_NETWORKS[CONTRACTS.PRIMACULT_NFT.chainId].currency,
        decimals: 18,
    },
    rpcUrls: {
        default: { http: [SUPPORTED_NETWORKS[CONTRACTS.PRIMACULT_NFT.chainId].rpcUrl] },
        public: { http: [SUPPORTED_NETWORKS[CONTRACTS.PRIMACULT_NFT.chainId].rpcUrl] },
    },
};

const NFT_ABI = [
    { name: 'ownerOf', inputs: [{ type: 'uint256' }], outputs: [{ type: 'address' }], stateMutability: 'view', type: 'function' },
    { name: 'totalSupply', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view', type: 'function' },
    { name: 'tokenURI', inputs: [{ type: 'uint256' }], outputs: [{ type: 'string' }], stateMutability: 'view', type: 'function' },
] as const;

const client = createPublicClient({
    chain: APECHAIN_CONFIG,
    transport: http(),
});

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const ownerAddress = searchParams.get('address');

    if (!ownerAddress) {
        return NextResponse.json({ error: 'La dirección del propietario es requerida' }, { status: 400 });
    }

    try {
        const totalSupply = await client.readContract({
            address: NFT_CONTRACT_ADDRESS,
            abi: NFT_ABI,
            functionName: 'totalSupply',
        });

        // FIX: Bucle desde 0 hasta totalSupply - 1
        const ownerChecks = Array.from({ length: Number(totalSupply) }).map((_, i) => {
            const tokenId = BigInt(i); // Empezamos desde el token ID 0
            return client.readContract({
                address: NFT_CONTRACT_ADDRESS,
                abi: NFT_ABI,
                functionName: 'ownerOf',
                args: [tokenId],
            }).then(owner => ({
                tokenId,
                owner,
            })).catch(() => null);
        });

        const results = await Promise.all(ownerChecks);

        const ownedNftsInfo = results.filter(result => 
            result && String(result.owner).toLowerCase() === ownerAddress.toLowerCase()
        );

        if (ownedNftsInfo.length === 0) {
            return NextResponse.json({ nfts: [] });
        }
        
        const nfts: Nft[] = await Promise.all(
            ownedNftsInfo.map(async (nftInfo) => {
                const tokenId = nftInfo!.tokenId;
                const baseData: Nft = {
                    id: tokenId.toString(),
                    tokenId: tokenId.toString(),
                    name: `Primal #${tokenId.toString()}`,
                    imageUrl: '',
                };
                
                try {
                    const tokenUri = await client.readContract({
                        address: NFT_CONTRACT_ADDRESS,
                        abi: NFT_ABI,
                        functionName: 'tokenURI',
                        args: [tokenId],
                    });
                    
                    const metadataUrl = String(tokenUri).replace('ipfs://', 'https://ipfs.io/ipfs/');
                    const metadataResponse = await fetch(metadataUrl);
                    if (metadataResponse.ok) {
                        const metadata = await metadataResponse.json();
                        baseData.name = metadata.name || baseData.name;
                        baseData.imageUrl = metadata.image ? String(metadata.image).replace('ipfs://', 'https://ipfs.io/ipfs/') : '';
                    }
                } catch (e) {
                    console.error(`No se pudo obtener metadata para token #${tokenId}`, e);
                }

                return baseData;
            })
        );

        return NextResponse.json({ nfts });

    } catch (error: any) {
        console.error('Error en la ruta get-user-nfts:', error);
        return NextResponse.json({ error: { message: error.message } }, { status: 500 });
    }
}