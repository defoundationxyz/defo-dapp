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
}

interface Gem {
    id: BigNumber,
    gemTypeId: BigNumber;
    booster: BigNumber;
    mintTime: BigNumber;
    boostTime: BigNumber;
    lastRewardWithdrawalTime: BigNumber;
    lastMaintenanceTime: BigNumber;
    pendingMaintenanceFee: BigNumber;
    taxTier: any;
    rewardAmount: any;
    isClaimable: any;
    staked: any;
    fi?: any;
}


export type { GemTypeConfig, Gem }