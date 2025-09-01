import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { CONTRACTS, SUPPORTED_NETWORKS } from '../../../config/contracts';

// --- CONFIGURACIÓN ---
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
    blockExplorers: {
        default: { name: 'ApeChain Explorer', url: SUPPORTED_NETWORKS[CONTRACTS.PRIMACULT_NFT.chainId].explorer },
    },
};

const NFT_ABI = [
    {
        "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
        "name": "ownerOf",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    }
] as const;

const client = createPublicClient({
    chain: APECHAIN_CONFIG,
    transport: http()
});

// --- LÓGICA DE LA API ---
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('address');
    const tokenId = searchParams.get('tokenId');

    if (!tokenId || !userAddress) {
        return NextResponse.json({ error: 'Faltan los parámetros tokenId o address' }, { status: 400 });
    }

    try {
        const owner = await client.readContract({
            address: NFT_CONTRACT_ADDRESS,
            abi: NFT_ABI,
            functionName: 'ownerOf',
            args: [BigInt(tokenId)]
        });

        const isOwner = owner.toLowerCase() === userAddress.toLowerCase();

        return NextResponse.json({ isOwner });

    } catch (error) {
        console.error('Error al verificar propiedad del NFT:', error);
        // Este error comúnmente ocurre si el tokenId no existe.
        return NextResponse.json({ isOwner: false, error: 'El NFT no existe o la verificación falló.' }, { status: 500 });
    }
}