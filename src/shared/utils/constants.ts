import { BigNumber } from 'ethers'
import DAI_ABI from 'abi/DAI.json'
import DEFO_ABI from 'abi/DEFO.json'
import ConfigFacet from 'abi/facets/ConfigFacet.json'
import LimiterFacet from 'abi/facets/LimiterFacet.json'
import MaintenanceFacet from 'abi/facets/MaintenanceFacet.json'
import RedeemFacet from 'abi/facets/RedeemFacet.json'
import RewardFacet from 'abi/facets/RewardFacet.json'
import VaultFacet from 'abi/facets/VaultFacet.json'
import YieldGemFacet from 'abi/facets/YieldGemFacet.json'
import GettersFacet from 'abi/facets/GettersFacet.json'
import DonationsFacet from 'abi/facets/DonationsFacet.json'
import JoeRouterABI from "abi/JoeRouter.json"
import JoeFactoryABI from "abi/JoeFactory.json"
import JoePairABI from "abi/JoePair.json"

export const INFURA_ID = process.env.NEXT_PUBLIC_INFURA_ID

export const RPC = {
    43114: "https://api.avax.network/ext/bc/C/rpc",
    43113: "https://api.avax-test.network/ext/bc/C/rpc",
    4: `https://rinkeby.infura.io/v3/${INFURA_ID}`,
    1337: `http://localhost:8545`
}

export const CONTRACTS_ABI = [
    ...ConfigFacet,
    ...LimiterFacet,
    ...MaintenanceFacet,
    ...RedeemFacet,
    ...RewardFacet,
    ...VaultFacet,
    ...YieldGemFacet,
    ...GettersFacet,
    ...DonationsFacet
]

export enum SUPPORTED_NETWORKS_ENUM {
    AVAX_MAINNET = 'avax_mainnet',
    FUJI_TESTNET = 'fuji_testnet',
    HARDHAT = 'hardhat',
    RINKEBY = 'rinkeby',
}

export const NETWORK_MAPPER: { [key: number]: string } = {
    43114: SUPPORTED_NETWORKS_ENUM.AVAX_MAINNET,
    43113: SUPPORTED_NETWORKS_ENUM.FUJI_TESTNET,
    1337: SUPPORTED_NETWORKS_ENUM.HARDHAT,
    4: SUPPORTED_NETWORKS_ENUM.RINKEBY
}

export const ACTIVE_NETOWORKS_COLLECTION = [1337, 43113]


export const SUPPORTED_NETWORKS: { [key: string]: ConfigType } = {
    avax_mainnet: {
        chainName: "Avalanche Mainnet C-Chain",
        chainId: 43114,
        chainRPC: "https://api.avax.network/ext/bc/C/rpc",
        chainExplorer: "https://snowtrace.io/",
        nativeCurrency: {
            name: "AVAX",
            symbol: "AVAX",
            decimals: 18
        },
        deployments: {
            dai: {
                abi: DAI_ABI,
                address: "0xd586e7f844cea2f87f50152665bcbc2c279d8d70"
            },
            defo: {
                abi: DAI_ABI,
                address: ""
            },
            diamond: {
                abi: CONTRACTS_ABI,
                address: ""
            },
        }
    },
    fuji_testnet: {
        chainName: "Avalanche FUJI C-Chain",
        chainId: 43113,
        chainRPC: "https://api.avax-test.network/ext/bc/C/rpc",
        chainExplorer: "https://testnet.snowtrace.io/",
        nativeCurrency: {
            name: "AVAX",
            symbol: "AVAX",
            decimals: 18
        },
        deployments: {
            dai: {
                abi: DAI_ABI,
                address: "0x3362FE2f7E17A5a9F90DaBE12E4A6E16E146F19a"
            },
            defo: {
                abi: DEFO_ABI,
                address: "0xA9D3adb2B5c7d89c56d74584E98ABcea1E4e6a4D"
            },
            diamond: {
                abi: CONTRACTS_ABI,
                address: "0xf0d26dD82f6beE798cB677ee17E5466d009193Eb"
            },
            dex: {
                router: {
                    abi: JoeRouterABI,
                    address: "0xd7f655E3376cE2D7A2b08fF01Eb3B1023191A901"
                },
                factory: {
                    abi: JoeFactoryABI
                },
                pair: {
                    abi: JoePairABI
                }
            }
        }
    },
    hardhat: {
        chainName: "Hardhat localhost",
        chainId: 1337,
        chainRPC: RPC[1337],
        chainExplorer: "https://testnet.snowtrace.io/",
        nativeCurrency: {
            name: "GO",
            symbol: "GO",
            decimals: 18
        },
        deployments: {
            dai: {
                abi: DAI_ABI,
                address: "0xd586e7f844cea2f87f50152665bcbc2c279d8d70"
            },
            defo: {
                abi: DEFO_ABI,
                address: "0xEFac7869B91F3dc100340a61dfE77839B89ba86D"
            },
            diamond: {
                abi: CONTRACTS_ABI,
                address: "0x66Cf45e57D524959B539e0907FE4B18F8AfC4D84"
            }
        }
    },
    rinkeby: {
        chainName: "Rinkeby Test Network",
        chainId: 4,
        chainRPC: `https://rinkeby.infura.io/v3/${INFURA_ID}`,
        chainExplorer: "https://rinkeby.etherscan.io/",
        nativeCurrency: {
            name: "ETH",
            symbol: "ETH",
            decimals: 18
        }
    }
}


// change this to change the required network
export const ACTIVE_NETWORK = SUPPORTED_NETWORKS.hardhat


export const MIN_REWARD_TIME = (3600 * 24) * 7; // (seconds in a day) * count days


export const TAX_TIERS: any = {
    43114: {
        '0': "30%",
        '1': "30%",
        '2': "30%",
        '3': "15%",
        '4': "0%"
    },
    43113: {
        '0': "30%",
        '1': "20%",
        '2': "15%",
        '3': "10%",
        '4': "0%"
    }
}


export type ConfigType = {
    chainName: string,
    chainId: number,
    chainRPC: string,
    chainExplorer: string,
    forkNetwork?: SUPPORTED_NETWORKS_ENUM.AVAX_MAINNET,
    nativeCurrency: {
        name: string,
        symbol: string,
        decimals: number
    },

    deployments?: {
        dai: {
            address: string
            abi: any[]
        }
        defo: {
            address: string,
            abi: any[]
        },
        diamond: {
            address: string,
            abi: any[]
        },
        dex?: {
            router: {
                address: string,
                abi: any[]
            },
            factory: {
                abi: any[],
            },
            pair: {
                abi: any[]
            }
        }
    }
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
