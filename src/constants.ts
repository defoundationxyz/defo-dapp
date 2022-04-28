
import { ContractInterface } from 'ethers'
import { Color, colors } from '@mui/material'

import SapphireNodeDelta_ABI from './abi/SapphireNodeDelta.json'
import SapphireNodeOmega_ABI from './abi/SapphireNodeOmega.json'
import RubyNodeDelta_ABI from './abi/RubyNodeDelta.json'
import RubyNodeOmega_ABI from './abi/RubyNodeOmega.json'
import DiamondNodeDelta_ABI from './abi/DiamondNodeDelta.json'
import DiamondNodeOmega_ABI from './abi/DiamondNodeOmega.json'


export const INFURA_ID = process.env.NEXT_PUBLIC_INFURA_ID


export const RPC = { 43113: "https://api.avax-test.network/ext/bc/C/rpc", 43114: "https://api.avax.network/ext/bc/C/rpc" }

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


export const ACTIVE_NETWORK = MAINNET_CONFIG


export const CONTRACT_ADDRESSES = {
    // MAINNET
    Dai: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70",
    DiamondNodeDelta: "0x1fF38cA054215aE6AF4D7cCadc44d871fDA5A82b",
    DiamondNodeOmega: "0x947c90eCC60C2ae9a61dE29fB799e7B9c58b52Ea",
    RubyNodeDelta: "0x22CcbC7D801d680ECf47D0650dE9b05DE7F609Ac",
    RubyNodeOmega: "0x99B29003a73575571AF3921bcc0FaF7Dbfd0A123",
    SapphireNodeDelta: "0x5DeF78995748e2cfF42F36DA0CC7625e4B19cDB2",
    SapphireNodeOmega: "0x52bd885E4F7059634f3dbcf226F8903c0ee886B1",

    //FUJI

    /*
    Dai: "0xE086579e82c2a3fCC52291CBBAF90D286E019b8b",
    DiamondNodeDelta: "0x512cA242eaFA47c9aBCa1333047651F1C71a2fFA",
    DiamondNodeOmega: "0x0451C567452fDf4D087927173d2cB021935DE4a7",
    RubyNodeDelta: "0x7265983d9155059D6589b4DF3991ce071B3a52AC",
    RubyNodeOmega: "0xc92541a2ec5C0cc25f9Cb78A17f0DC1CcE891e24",
    SapphireNodeDelta: "0xfeD2F8C878220EE47C5d1bc077c9CeC9C81Ad922",
    SapphireNodeOmega: "0xD70b31a041E4D1d5eA31D64Cf1B078588dCD5D72",
    */
}



export const NATIVE_CURRENCY = {
    name: "AVAX",
    symbol: "AVAX",
    decimals: 18
}

export type NodeType = "SAPPHIRE_NODE" | "RUBY_NODE" | "DIAMOND_NODE"

// export interface NodeConfig {
//     TYPE: NodeType,
//     SYMBOL: string,
//     REWARD_RATE: number,
//     MAINTENANCE_FEE: number,
//     ABI: ContractInterface,
//     ADDRESS: string,
//     BAR_COLOR: Color,
// }

export type NFTType = "OMEGA_NFT" | "DELTA_NFT"


export interface NFTNodeType {
    SYMBOL: string,
    TYPE: NodeType,
    ABI: ContractInterface,
    ADDRESS: string,
    BUTTON_COLOR: Color,
}


export interface NFTConfig {
    NAME: string,
    TYPE: NFTType,
    REWARD_BOOST: number,
    YIELD_GEMS_INCLUDED: number,
    MAXIMUM_YIELD_GEMS: number,
    MAINTENANCE_FEE: number,
    PERKS: Array<String>;
    CONTRACTS: { [key in NodeType]: NFTNodeType },
    BAR_COLOR: Color
}


export const NFT_CONFIGS: { [key in NFTType]: NFTConfig } = {
    DELTA_NFT: {
        NAME: "DELTA NFT",
        TYPE: "DELTA_NFT",
        BAR_COLOR: colors.blue,
        REWARD_BOOST: 25,
        YIELD_GEMS_INCLUDED: 1,
        MAXIMUM_YIELD_GEMS: 2,
        MAINTENANCE_FEE: -25,
        PERKS: [
            "-50% reduction"
        ],
        CONTRACTS: {
            SAPPHIRE_NODE: {
                SYMBOL: "DSDN",
                TYPE: "SAPPHIRE_NODE",
                ABI: SapphireNodeDelta_ABI,
                ADDRESS: CONTRACT_ADDRESSES.SapphireNodeDelta,
                BUTTON_COLOR: colors.blue
            },
            RUBY_NODE: {
                SYMBOL: "DRDN",
                TYPE: "RUBY_NODE",
                ABI: RubyNodeDelta_ABI,
                ADDRESS: CONTRACT_ADDRESSES.RubyNodeDelta,
                BUTTON_COLOR: colors.pink
            },
            DIAMOND_NODE: {
                SYMBOL: "DDDN",
                TYPE: "DIAMOND_NODE",
                ABI: DiamondNodeDelta_ABI,
                ADDRESS: CONTRACT_ADDRESSES.DiamondNodeDelta,
                BUTTON_COLOR: colors.lightGreen
            }
        }
    },

    OMEGA_NFT: {
        NAME: "OMEGA NFT",
        TYPE: "OMEGA_NFT",
        BAR_COLOR: colors.pink,
        REWARD_BOOST: 50,
        YIELD_GEMS_INCLUDED: 1,
        MAXIMUM_YIELD_GEMS: 3,
        MAINTENANCE_FEE: -50,
        PERKS: [
            "-90% reduction",
        ],
        CONTRACTS: {
            SAPPHIRE_NODE: {
                SYMBOL: "DSDN",
                TYPE: "SAPPHIRE_NODE",
                ABI: SapphireNodeOmega_ABI,
                ADDRESS: CONTRACT_ADDRESSES.SapphireNodeOmega,
                BUTTON_COLOR: colors.blue
            },
            RUBY_NODE: {
                SYMBOL: "DSDN",
                TYPE: "RUBY_NODE",
                ABI: RubyNodeOmega_ABI,
                ADDRESS: CONTRACT_ADDRESSES.RubyNodeOmega,
                BUTTON_COLOR: colors.pink
            },
            DIAMOND_NODE: {
                SYMBOL: "DDON",
                TYPE: "DIAMOND_NODE",
                ABI: DiamondNodeOmega_ABI,
                ADDRESS: CONTRACT_ADDRESSES.DiamondNodeOmega,
                BUTTON_COLOR: colors.lightGreen
            }
        }
    },
}





// export const NODE_CONFIGS: { [key in NodeType]: NodeConfig } = {
//     SAPPHIRE_NODE: {
//         TYPE: "SAPPHIRE_NODE",
//         SYMBOL: "DSN",
//         REWARD_RATE: 4.5,
//         MAINTENANCE_FEE: 3,
//         ABI: SAPPHIRE_NODE_ABI,
//         ADDRESS: CONTRACT_ADDRESSES.SAPPHIRE,
//         BAR_COLOR: colors.green
//     },
//     RUBY_NODE: {
//         TYPE: "RUBY_NODE",
//         SYMBOL: "DRN",
//         REWARD_RATE: 4.75,
//         MAINTENANCE_FEE: 3,
//         ABI: RUBY_NODE_ABI,
//         ADDRESS: CONTRACT_ADDRESSES.RUBY,
//         BAR_COLOR: colors.blue
//     },
//     DIAMOND_NODE: {
//         TYPE: "DIAMOND_NODE",
//         SYMBOL: "DDN",
//         REWARD_RATE: 5,
//         MAINTENANCE_FEE: 3,
//         ABI: DIAMOND_NODE_ABI,
//         ADDRESS: CONTRACT_ADDRESSES.DIAMOND,
//         BAR_COLOR: colors.pink
//     },

// }
