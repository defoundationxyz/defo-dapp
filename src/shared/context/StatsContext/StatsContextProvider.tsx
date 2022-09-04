import { BigNumber } from "ethers"
import { ReactChild, useContext, useEffect, useState } from "react"
import { useWeb3Contract } from "react-moralis"
import { ProtocolConfig } from "shared/types/DataTypes"
import { useDiamondContext } from "../DiamondContext/DiamondContextProvider"
import { useGemsContext } from "../GemContext/GemContextProvider"
import { useWeb3 } from "../Web3/Web3Provider"
import StatsContext from "./StatsContext"

export type StakeState = {
    totalStake: BigNumber,
    userStake: BigNumber,
}

export type DonationsState = {
    totalDonations: BigNumber,
    userDonations: BigNumber,
}

const donationsInit = {
    totalDonations: BigNumber.from(0),
    userDonations: BigNumber.from(0),
}

export const stateInit = {
    totalStake: BigNumber.from(0),
    userStake: BigNumber.from(0),
}

const initialProtocolConfigState: ProtocolConfig = {
    paymentTokens: [],
    wallets: [],
    incomeDistributionOnMint: [],
    maintenancePeriod: 0,
    rewardPeriod: 0,
    taxScaleSinceLastClaimPeriod: 0,
    taxRates: [],
    charityContributionRate: BigNumber.from(0),
    vaultWithdrawalTaxRate: BigNumber.from(0),
    taperRate: BigNumber.from(0),
    mintLock: true,
    transferLock: true,
    mintLimitWindow: 0,
}

const StatsContextProvider = ({ children }: { children: ReactChild }) => {
    const { diamondContract, config } = useDiamondContext()
    const { account, signer, provider, isWeb3Enabled } = useWeb3()

    const [stake, setStake] = useState<StakeState>(stateInit)
    const [donations, setDonations] = useState<DonationsState>(donationsInit)
    const [protocolConfig, setProtocolConfig] = useState<ProtocolConfig>(initialProtocolConfigState)

    const { runContractFunction } = useWeb3Contract({});

    // main fetch init/change
    useEffect(() => {
        const load = async () => {
            if (isWeb3Enabled && config) {
                await updateStake();
                await updateDonations();
                await updateProtocolConfig();
            }
        }

        load()
    }, [account, signer, provider, diamondContract])

    const updateStake = async () => {
        let totalStake: any = BigNumber.from(0);
        let userStake: any = BigNumber.from(0);

        try {
            totalStake = await diamondContract.getTotalStakedAllUsers();
            userStake = await diamondContract.getTotalStaked();
        } catch (error) {
            console.log('Error while fetching the STAKE');
            console.log(error);
        }
        setStake({ totalStake, userStake })
    }

    const updateStake2 = async () => {
        console.log('updateStake EXECUTED...!');
        const options = {
            abi: config.deployments.diamond.abi,
            contractAddress: config.deployments.diamond.address,
            functionName: "getTotalStakedAllUsers"
        }
        const totalStake: any = await runContractFunction({ params: options })
        const userStake: any = await runContractFunction({ params: { ...options, functionName: "getTotalStaked" } });

        setStake({ totalStake, userStake })
    }

    const updateDonations = async () => {
        let totalDonations: any = BigNumber.from(0);
        let userDonations: any = BigNumber.from(0);

        const options = {
            abi: config.deployments.diamond.abi,
            contractAddress: config.deployments.diamond.address
        }

        try {
            // totalDonations = await runContractFunction({ params: { ...options, functionName: "getTotalDonatedAllUsers" }});
            // userDonations = await runContractFunction({ params: { ...options, functionName: "getTotalDonated" }});
            userDonations = await diamondContract.getTotalDonated();
            totalDonations = await diamondContract.getTotalDonatedAllUsers();

        } catch (error) {
            console.log('Error while fetching the DONATIONS');
            console.log(error);
        }
        setDonations({ totalDonations, userDonations })
    }

    const updateProtocolConfig = async () => {
        try {
            const currentProtocolConfig = await diamondContract.getConfig()
            setProtocolConfig(currentProtocolConfig)
        } catch (error) {
            console.log('Error while fetching PROTOCOL CONFIG');
            console.log(error);
        }
    }


    const value = {
        stake, updateStake,
        donations, updateDonations,
        protocolConfig, updateProtocolConfig
    }

    return (
        <StatsContext.Provider value={value}>
            {children}
        </StatsContext.Provider>
    )
}

const useStatsContext = () => {
    const context = useContext(StatsContext)
    if (!context) {
        throw new Error("useStatsContext must be used within StatsContextProvider")
    }
    return context;
}


export { StatsContextProvider, useStatsContext }