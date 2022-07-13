import { Contract } from "ethers";
import { useContext, useState } from "react";
import { CONTRACTS, GemTypeMetadata } from "shared/utils/constants";
import { useWeb3 } from "../Web3/Web3Provider";
import GemContext from "./GemContext";


const GemContextProvider = ({ children }: { children: any}) => {
    const { signer } = useWeb3();
    const [yieldGemsMetadata, setYieldGemsMetadata] = useState({
        gem0: {},
        gem1: {},
        gem2: {},
    });

    
    const fetchGemMetadata = async (gemType: 0 | 1 | 2) => {
        const contract = new Contract(CONTRACTS.Main.address, CONTRACTS.Main.abi, signer);

        const currentGem = await contract.GetGemTypeMetadata(gemType);
        let currentGemTyped: GemTypeMetadata = {
            LastMint: currentGem[0],
            MaintenanceFee: currentGem[1],
            RewardRate: currentGem[2],
            DailyLimit: currentGem[3],
            MintCount: currentGem[4],
            DefoPrice: currentGem[5],
            StablePrice: currentGem[6],
        };

        if(gemType === 0) { 
            setYieldGemsMetadata({ ...yieldGemsMetadata, gem0: currentGemTyped });
        } else if (gemType === 1) { 
            setYieldGemsMetadata({ ...yieldGemsMetadata, gem1: currentGemTyped });
        } else if (gemType === 2) { 
            setYieldGemsMetadata({ ...yieldGemsMetadata, gem2: currentGemTyped });
        }

    }


    const providerValue = { 
        yieldGemsMetadata, fetchGemMetadata
    }

    return (
        <GemContext.Provider value={providerValue}>
            {children}
        </GemContext.Provider>
    );
}


const useGemContext = () => {
    const context = useContext(GemContext);

    if (context === undefined) {
        throw new Error('useGemContext must be used within a GemContextProvider!');
    }

    return context
}

export { GemContextProvider, useGemContext };
