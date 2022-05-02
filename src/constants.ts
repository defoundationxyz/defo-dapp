
import { BigNumber } from 'ethers'
import Dai_ABI from './abi/DAI.json'
import DiamonCutFacet_ABI from './abi/facets/DiamondCutFacet.json'
import DiamonLoupeFacet_ABI from './abi/facets/DiamondLoupeFacet.json'
import ERC721EnumerableFacet_ABI from './abi/facets/ERC721EnumerableFacet.json'
import ERC721Facet_ABI from './abi/facets/ERC721Facet.json'
import GemFacet_ABI from './abi/facets/GemFacet.json'
import GemGettersFacet_ABI from './abi/facets/GettersFacet.json'
import NodeLimiterFacet_ABI from './abi/facets/NodeLimiterFacet.json'
import OwnerFacet_ABI from './abi/facets/OwnerFacet.json'
import OwnershipFacet_ABI from './abi/facets/OwnershipFacet.json'
import VaultStakingFacet_ABI from './abi/facets/VaultStakingFacet.json'


export const INFURA_ID = process.env.NEXT_PUBLIC_INFURA_ID


export const RPC = {
    43114: "https://api.avax.network/ext/bc/C/rpc",
    43113: "https://api.avax-test.network/ext/bc/C/rpc",
    4: `https://rinkeby.infura.io/v3/${INFURA_ID}`
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



export const ACTIVE_NETWORK = RINKEBY_CONFIG


export const CONTRACTS = {

    //FUJI

    Dai: {
        abi: Dai_ABI,
        // address: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70",      // mainnet
        address: "0x0730ebE45b12284C37CEbA4BBB96C1208EAF9122",      // testnet

    },

    DefoToken: {
        abi: Dai_ABI,
        address: "0x4ca5C84333c0C50CFc4A5CdEEeff9fd051Ab1f4A",
    },

    Main: {
        // address: "0x78c51f56e21994FB5d00D2A817Bca4c5B735FDcb",  // mainnet
        address: "0x3b8902832005DB7Cc52E921436dA24357C5aE8F8",  // testnet
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