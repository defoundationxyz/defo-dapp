import { BigNumber, ethers } from "ethers";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import { useWeb3Contract } from "react-moralis";
import { Gem, GemsConfigState, GemTypeConfig } from "shared/types/DataTypes";
import { GemTypeMetadata } from "shared/utils/constants";
import { getMaintenanceFeeDaiForGem, getNextTier } from "shared/utils/helper";
import { useDiamondContext } from "../DiamondContext/DiamondContextProvider";
import { useWeb3 } from "../Web3/Web3Provider";
import GemContext from "./GemContext";


const initialGemConfigState: GemTypeConfig = {
    maintenanceFeeDai: BigNumber.from(0),
    rewardAmountDefo: BigNumber.from(0),
    price: [BigNumber.from(0), BigNumber.from(0)],
    taperRewardsThresholdDefo: BigNumber.from(0),
    maxMintsPerLimitWindow: BigNumber.from(0),
    isMintAvailable: false
}


const GemContextProvider = ({ children }: { children: any }) => {
    const { diamondContract, config } = useDiamondContext()
    const { signer, status, account, provider, isWeb3Enabled, chainId } = useWeb3();
    const [gemsMetadata, setGemsMetadata] = useState({
        gem0: {},
        gem1: {},
        gem2: {},
    });


    const [gemsCollection, setGemsCollection] = useState<Gem[]>([])
    const [gemsConfig, setGemsConfig] = useState<GemsConfigState>({
        gem0: initialGemConfigState,
        gem1: initialGemConfigState,
        gem2: initialGemConfigState,
    })

    const { runContractFunction } = useWeb3Contract({});

    useEffect(() => {
        const load = async () => {
            if (isWeb3Enabled && diamondContract) {
                await updateGemsConfig();
            }
        }
        load()
    }, [account, signer, provider, diamondContract,])

    useEffect(() => {
        const load = async () => {
            if (isWeb3Enabled && diamondContract && !gemsConfig.gem0.maintenanceFeeDai.isZero()) {
                await updateGemsCollection();
            }
        }
        load()
    }, [account, signer, provider, diamondContract, gemsConfig])


    const fetchGemMetadata = async (gemType: 0 | 1 | 2) => {
        const currentGem = await diamondContract.GetGemTypeMetadata(gemType);
        let currentGemTyped: GemTypeMetadata = {
            LastMint: currentGem[0],
            MaintenanceFee: currentGem[1],
            RewardRate: currentGem[2],
            DailyLimit: currentGem[3],
            MintCount: currentGem[4],
            DefoPrice: currentGem[5],
            StablePrice: currentGem[6],
        };

        if (gemType === 0) {
            setGemsMetadata({ ...gemsMetadata, gem0: currentGemTyped });
        } else if (gemType === 1) {
            setGemsMetadata({ ...gemsMetadata, gem1: currentGemTyped });
        } else if (gemType === 2) {
            setGemsMetadata({ ...gemsMetadata, gem2: currentGemTyped });
        }
    }

    const updateGemsConfig = async () => {
        try {
            const gemsConfig = await diamondContract.getGemTypesConfig()

            let gem0Config: GemTypeConfig = gemsConfig[0]
            let gem1Config: GemTypeConfig = gemsConfig[1]
            let gem2Config: GemTypeConfig = gemsConfig[2]

            gem0Config = { ...gem0Config, isMintAvailable: await diamondContract.isMintAvailable(0) }
            gem1Config = { ...gem1Config, isMintAvailable: await diamondContract.isMintAvailable(1) }
            gem2Config = { ...gem2Config, isMintAvailable: await diamondContract.isMintAvailable(2) }

            setGemsConfig({
                gem0: gem0Config,
                gem1: gem1Config,
                gem2: gem2Config,
            })
        } catch (error) {
            console.log('ERROR while updateGemsConfig');
            console.log(error);
        }
    }

    const updateGemsCollection = async () => {
        const currentGems: Gem[] = []

        const options = {
            abi: config.deployments.diamond.abi,
            contractAddress: config.deployments.diamond.address,
            functionName: "getGemsInfo"
        }

        try {
            const gemsInfo: any = await runContractFunction({ params: options })

            // const gemsInfo = await diamondContract.getGemsInfo()
            const protocolConfig = await diamondContract.getConfig()
            const taxScaleSinceLastClaimPeriodDays = Math.floor(protocolConfig.taxScaleSinceLastClaimPeriod / (3600 * 24))
            const maintenancePeriodDays = Math.floor(protocolConfig.maintenancePeriod / (3600 * 24))

            for (let i = 0; i < gemsInfo[0].length; i++) {
                const gemId: BigNumber = gemsInfo[0][i]
                const gemData = gemsInfo[1][i]
                const pendingMaintenanceFee = await diamondContract.getPendingMaintenanceFee(gemId)
                const taxTier = await diamondContract.getTaxTier(gemId)
                const rewardAmount = await diamondContract.getRewardAmount(gemId)
                const isClaimable = await diamondContract.isClaimable(gemId)
                const staked = await diamondContract.getStaked(gemId)
                const maintenanceFeeUntil = moment(gemData.lastMaintenanceTime, "X").add(maintenancePeriodDays, 'days')
                const gemMaintenanceFeeDai = getMaintenanceFeeDaiForGem(gemsConfig, gemData.gemTypeId, gemData.booster)

                let nextTier: any = "";
                if (taxTier < 4) {
                    nextTier = await getNextTier(provider, gemData.lastRewardWithdrawalTime, taxScaleSinceLastClaimPeriodDays);
                }

                const newGem: Gem = {
                    id: gemId.toString(),
                    gemTypeId: gemData.gemTypeId,
                    booster: gemData.booster,
                    mintTime: gemData.mintTime,
                    boostTime: gemData.boostTime,
                    lastRewardWithdrawalTime: gemData.lastRewardWithdrawalTime,
                    lastMaintenanceTime: gemData.lastMaintenanceTime,
                    maintenanceFeeUntil,
                    gemMaintenanceFeeDai,
                    nextTierDaysLeft: nextTier,
                    pendingMaintenanceFee,
                    taxTier,
                    rewardAmount,
                    isClaimable,
                    staked,
                }
                currentGems.push(newGem)
            }
        } catch (error) {
            console.log('ERROR while updateGemsCollection');
            console.log(error);
        }

        setGemsCollection(currentGems)
    }


    const providerValue = {
        gemsMetadata, fetchGemMetadata,
        gemsConfig, updateGemsConfig,
        gemsCollection, updateGemsCollection
    }

    return (
        <GemContext.Provider value={providerValue}>
            {children}
        </GemContext.Provider>
    );
}


const useGemsContext = () => {
    const context = useContext(GemContext);

    if (context === undefined) {
        throw new Error('useGemContext must be used within a GemContextProvider!');
    }

    return context
}

export { GemContextProvider, useGemsContext };
