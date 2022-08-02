import { BigNumber } from "ethers";

type Booster = {

}

type Fi = {

}

interface GemTypeConfig {
    maintenanceFeeDai: BigNumber;
    rewardAmountDefo: BigNumber;
    price: [BigNumber, BigNumber];
    taperRewardsThresholdDefo: BigNumber;
    maxMintsPerLimitWindow: BigNumber;
    isMintAvailable: boolean
}

type GemsConfigState = {
	gem0: GemTypeConfig,
	gem1: GemTypeConfig,
	gem2: GemTypeConfig,
}

type GemTypeMintWindow = { 
    mintCount: BigNumber,
    endOfMintLimitWindow: number
}

interface Gem {
    id: BigNumber,
    gemTypeId: number;
    booster: number;
    mintTime: Date;
    boostTime: number;
    lastRewardWithdrawalTime: Date;
    lastMaintenanceTime: Date;
    pendingMaintenanceFee: BigNumber;
    taxTier: number;
    rewardAmount: BigNumber;
    isClaimable: boolean;
    staked: BigNumber;
    fi?: any;
}


export type { GemTypeConfig, GemsConfigState, GemTypeMintWindow, Gem }