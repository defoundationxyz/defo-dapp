import { BigNumber } from 'ethers'
import Dai_ABI from 'abi/DAI.json'
import DiamonCutFacet_ABI from 'abi/facets/DiamondCutFacet.json'
import DiamonLoupeFacet_ABI from 'abi/facets/DiamondLoupeFacet.json'
import ERC721EnumerableFacet_ABI from 'abi/facets/ERC721EnumerableFacet.json'
import ERC721Facet_ABI from 'abi/facets/ERC721Facet.json'
import GemFacet_ABI from 'abi/facets/GemFacet.json'
import GemGettersFacet_ABI from 'abi/facets/GettersFacet.json'
import NodeLimiterFacet_ABI from 'abi/facets/NodeLimiterFacet.json'
import OwnerFacet_ABI from 'abi/facets/OwnerFacet.json'
import OwnershipFacet_ABI from 'abi/facets/OwnershipFacet.json'
import VaultStakingFacet_ABI from 'abi/facets/VaultStakingFacet.json'

export const INFURA_ID = process.env.NEXT_PUBLIC_INFURA_ID

export const RPC = {
    43114: "https://api.avax.network/ext/bc/C/rpc",
    43113: "https://api.avax-test.network/ext/bc/C/rpc",
    4: `https://rinkeby.infura.io/v3/${INFURA_ID}`,
    1337: `http://localhost:8545`
}

export const MAINNET_CONFIG = {
    CHAIN_NAME: "Avalanche Mainnet C-Chain",
    CHAIN_ID: 43114,
    CHAIN_RPC: RPC[43114],
    CHAIN_EXPLORER: "https://snowtrace.io/",
}

export const TESTNET_CONFIG = {
    CHAIN_NAME: "Avalanche FUJI C-Chain",
    CHAIN_ID: 43113,
    CHAIN_RPC: RPC[43113],
    CHAIN_EXPLORER: "https://testnet.snowtrace.io/",
}


export const RINKEBY_CONFIG = {
    CHAIN_NAME: "Rinkeby Test Network",
    CHAIN_ID: 4,
    CHAIN_RPC: RPC[4],
    CHAIN_EXPLORER: "https://rinkeby.etherscan.io/",
}

export const LOCALHOST_HARDHAT_CONFIG = { 
    CHAIN_NAME: "Hardhat localhost",
    CHAIN_ID: 1337,
    CHAIN_RPC: RPC[1337],
    CHAIN_EXPLORER: "https://testnet.snowtrace.io/",
}


// change this to change the required network
export const ACTIVE_NETWORK = LOCALHOST_HARDHAT_CONFIG


export const CONTRACTS = {

    //FUJI
    Dai: {
        abi: Dai_ABI,
        // address: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70",      // mainnet
        address: "0x85a2ff500E0eD9fA93719071EA46A86198181581",      // testnet

    },

    DefoToken: {
        abi: Dai_ABI,
        address: "0x5C7ea2D484464a6Be1c2028CE1E9e1Ec339Dd3Ae",
    },

    Main: {
        // address: "0x78c51f56e21994FB5d00D2A817Bca4c5B735FDcb",  // mainnet
        // address: "0xd274d23b3Ae1b2a6c45b400e66dC64FBB3053222",  // testnet
        // address: "0xD4BbEE565C8EeDB54eD9d90c5205c92Eb684539C", // FUJI
        address: "0xc992E7C2A4fb668554390ae14cb05e8F5fbd1E77", // localhost
        abi: [
            ...DiamonCutFacet_ABI,
            ...DiamonLoupeFacet_ABI,
            ...ERC721EnumerableFacet_ABI,
            ...ERC721Facet_ABI,
            ...GemFacet_ABI,
            ...GemGettersFacet_ABI,
            ...NodeLimiterFacet_ABI,
            ...OwnerFacet_ABI,
            ...OwnershipFacet_ABI,
            ...VaultStakingFacet_ABI,
        ]
    }

}



export const NATIVE_CURRENCY = {
    name: "AVAX",
    symbol: "AVAX",
    decimals: 18
}


export type GemType = {
    id: string;
    MintTime: number;
    LastReward: number;
    LastMaintained: number;
    GemType: number;
    TaperCount: number;
    Booster: number;
    claimedReward: BigNumber;
    pendingReward: BigNumber;
}


export type GemTypeMetadata = {
    LastMint: number;
    MaintenanceFee: number;
    RewardRate: number;
    DailyLimit: number;
    MintCount: number;
    DefoPrice: BigNumber;
    StablePrice: BigNumber;
}
