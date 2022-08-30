import { Contract } from "ethers";
import { useContext, useEffect, useState } from "react";
import { NETWORK_MAPPER, SUPPORTED_NETWORKS } from "shared/utils/constants";
import { useWeb3 } from "../Web3/Web3Provider";
import DiamondContext from "./DiamondContext";


const DiamondContextProvider = ({ children }: { children: any }) => {
    const [ diamondContract, setDiamondContract ] = useState<any>(null);
    const [config, setConfig] = useState<any>(null);

    const { signer, provider, isWeb3Enabled, chainId } = useWeb3()
    

    // INITIALIZE DIAMOND
    useEffect(() => {
        const signerOrProvider = signer ? signer : provider;
        if(!chainId) { return; }
        connectDEFO(signerOrProvider)
    }, [signer, provider, chainId])

    const connectDEFO = async (signerOrProvider: any) => {
        
        const networkName = NETWORK_MAPPER[chainId];
        const currentConfig = SUPPORTED_NETWORKS[networkName];
        if (!currentConfig?.deployments) {
            console.log('MISSING DEPLOYMENTS AT connectDEFO');
            return
        }
        
        const mainContract = new Contract(currentConfig.deployments.diamond.address, currentConfig.deployments.diamond.abi, signerOrProvider);
        setDiamondContract(mainContract);
        setConfig(currentConfig);
    }

    return (
        <DiamondContext.Provider value={{ diamondContract }}>
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
