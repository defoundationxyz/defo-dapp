import { providers, Signer } from "ethers";
import CHAIN_STATUS from "./ChainStatusTypes";

export interface IWeb3Context {
    status: CHAIN_STATUS;
    connect: any;
    signer: Signer | providers.Provider | undefined;
    account: string | undefined;
    switchNetwork: any
}


export default IWeb3Context