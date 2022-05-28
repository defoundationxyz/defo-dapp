import { Contract } from "ethers";
import { useContext, useState } from "react";
import { CONTRACTS, GemTypeMetadata } from "shared/utils/constants";
import { useWeb3 } from "../Web3/Web3Provider";
import DiamondContext from "./DiamondContext";


const DiamondContextProvider = ({ children }: { children: any}) => {
    const [ diamondContract, setDiamondContract] = useState();

    const providerValue = {
        diamondContract,
        setDiamondContract
    }

    return (
        <DiamondContext.Provider value={providerValue}>
            {children}
        </DiamondContext.Provider>
    );
}


const useDiamondContext = () => {
    const context = useContext(DiamondContext);

    if (context === undefined) {
        throw new Error('useDiamondContext must be used within a DiamondContextProvider!');
    }

    return context
}

export { DiamondContextProvider, useDiamondContext };
