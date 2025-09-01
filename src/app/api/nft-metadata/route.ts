import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, getContract } from 'viem';
import { CONTRACTS, SUPPORTED_NETWORKS } from '../../../config/contracts';

const NFT_CONTRACT_ADDRESS = CONTRACTS.PRIMACULT_NFT.address as `0x${string}`;

// ABI mínimo para obtener metadatos
const NFT_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "tokenURI",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

const client = createPublicClient({
  chain: {
    id: CONTRACTS.PRIMACULT_NFT.chainId,
    name: SUPPORTED_NETWORKS[CONTRACTS.PRIMACULT_NFT.chainId].name,
    network: 'apechain',
    nativeCurrency: {
      name: SUPPORTED_NETWORKS[CONTRACTS.PRIMACULT_NFT.chainId].currency,
      symbol: SUPPORTED_NETWORKS[CONTRACTS.PRIMACULT_NFT.chainId].currency,
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: [SUPPORTED_NETWORKS[CONTRACTS.PRIMACULT_NFT.chainId].rpcUrl],
      },
      public: {
        http: [SUPPORTED_NETWORKS[CONTRACTS.PRIMACULT_NFT.chainId].rpcUrl],
      },
    },
    blockExplorers: {
      default: {
        name: 'ApeChain Explorer',
        url: SUPPORTED_NETWORKS[CONTRACTS.PRIMACULT_NFT.chainId].explorer,
      },
    },
  },
  transport: http()
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenId = searchParams.get('tokenId');

    if (!tokenId) {
      return NextResponse.json(
        { error: 'Token ID es requerido' },
        { status: 400 }
      );
    }

    // Crear instancia del contrato
    const contract = getContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: NFT_ABI,
      publicClient: client,
    });

    // Obtener tokenURI
    const tokenURI = await contract.read.tokenURI([BigInt(tokenId)]);
    
    if (!tokenURI) {
      return NextResponse.json(
        { error: 'No se encontró metadata para este NFT' },
        { status: 404 }
      );
    }

    // Si el tokenURI es una URL IPFS, convertirla a HTTP
    let metadataUrl = tokenURI;
    if (tokenURI.startsWith('ipfs://')) {
      metadataUrl = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }

    // Obtener los metadatos
    const metadataResponse = await fetch(metadataUrl);
    if (!metadataResponse.ok) {
      throw new Error(`Error al obtener metadata: ${metadataResponse.status}`);
    }

    const metadata = await metadataResponse.json();

    // Procesar la imagen si es IPFS
    if (metadata.image && metadata.image.startsWith('ipfs://')) {
      metadata.image = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }

    return NextResponse.json({
      tokenId,
      name: metadata.name || `Primal #${tokenId}`,
      description: metadata.description,
      image: metadata.image,
      attributes: metadata.attributes || [],
      ...metadata
    });

  } catch (error) {
    console.error('Error al obtener metadata del NFT:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
