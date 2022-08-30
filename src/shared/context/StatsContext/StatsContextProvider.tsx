import { BigNumber } from "ethers"
import { ReactChild, useContext, useEffect, useState } from "react"
import { ProtocolConfig } from "shared/types/DataTypes"
import { useDiamondContext } from "../DiamondContext/DiamondContextProvider"
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
    const { diamondContract } = useDiamondContext()
    const { status, account, signer } = useWeb3()

    const [stake, setStake] = useState<StakeState>(stateInit)
    const [donations, setDonations] = useState<DonationsState>(donationsInit)
    const [protocolConfig, setProtocolConfig] = useState<ProtocolConfig>(initialProtocolConfigState)

    // main fetch init/change
    useEffect(() => {
        if (status === "CONNECTED") {
            updateStake()
            updateDonations()
            updateProtocolConfig()
        }
    }, [status, account, signer])

    const updateStake = async () => {
        let totalStake = BigNumber.from(0);
        let userStake = BigNumber.from(0);

        try {
            totalStake = await diamondContract.getTotalStakedAllUsers();
            userStake = await diamondContract.getTotalStaked();
        } catch (error) {
            console.log('Error while fetching the STAKE');
            console.log(error);
        }
        setStake({ totalStake, userStake })
        // return { totalStake, userStake }
    }

    const updateDonations = async () => {
        let totalDonations = BigNumber.from(0);
        let userDonations = BigNumber.from(0);

        try {
            totalDonations = await diamondContract.getTotalDonatedAllUsers();
            userDonations = await diamondContract.getTotalDonated();
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