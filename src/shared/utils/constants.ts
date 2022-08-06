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
// import Config_ABI from 'abi/facets/ConfigFacet.json'

import ConfigFacet from 'abi/facets-abi/ConfigFacet.json'
import LimiterFacet from 'abi/facets-abi/LimiterFacet.json'
import MaintenanceFacet from 'abi/facets-abi/MaintenanceFacet.json'
import RedeemFacet from 'abi/facets-abi/RedeemFacet.json'
import RewardFacet from 'abi/facets-abi/RewardFacet.json'
import VaultFacet from 'abi/facets-abi/VaultFacet.json'
import YieldGemFacet from 'abi/facets-abi/YieldGemFacet.json'
import GettersFacet from 'abi/facets-abi/GettersFacet.json'

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
        mainnetAddress: "0xd586e7f844cea2f87f50152665bcbc2c279d8d70",
        address: "0x85a2ff500E0eD9fA93719071EA46A86198181581",      // testnet
    },

    DefoToken: {
        abi: Dai_ABI,
        // address: "0x5C7ea2D484464a6Be1c2028CE1E9e1Ec339Dd3Ae",
        address: "0x4a6B7DCD5c271B2E36B8CE0fbB3097c2268ceC24",
    },

    Main: {
        address: "0x50dCA58237d32773E05F46a58A8b1Ad5E9384271", // localhost
        abi: [
            ...ConfigFacet,
            ...LimiterFacet,
            ...MaintenanceFacet,
            ...RedeemFacet,
            ...RewardFacet,
            ...VaultFacet,
            ...YieldGemFacet,
            ...GettersFacet
        ]
    }

}

export const GEM_MINT_LIMIT_HOURS = 12;
export const MIN_REWARD_TIME = (3600 * 24) * 7; // (seconds in a day) * count days

export const NATIVE_CURRENCY = {
    name: "AVAX",
    symbol: "AVAX",
    decimals: 18
}

export const TAX_TIER_MAPPER: any = { 
    '1': "30%",
    '2': "30%",
    '3': "15%",
    '4': "0%"
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
    vaultAmount?: BigNumber;
    isEligableForClaim?: any,
    taxTier: BigNumber,
    nextTaxTier: BigNumber,
}


export type GemTypeMetadata = {
    LastMint: number;
    MaintenanceFee: number;
    RewardRate: BigNumber;
    DailyLimit: number;
    MintCount: number;
    DefoPrice: BigNumber;
    StablePrice: BigNumber;
}
