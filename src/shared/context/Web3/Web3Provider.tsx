import Web3Context from "./Web3Context";
import IWeb3Context from "./types/IWeb3Context";
import WalletConnectProvider from "@walletconnect/web3-provider";
import {
    ReactChild,
    useContext,
    useState,
} from "react";
import Web3Modal, { IProviderOptions } from "web3modal";
import { providers, Signer } from "ethers";
import { hexlify, hexValue } from "ethers/lib/utils";
import { useSnackbar } from "shared/context/Snackbar/SnackbarProvider";
import { ACTIVE_NETWORK, INFURA_ID, NATIVE_CURRENCY, RPC } from "shared/utils/constants";
import CHAIN_STATUS from "./types/ChainStatusTypes";

const Web3Provider = ({theme = "light", children}: {theme: "dark" | "light"; children: ReactChild | ReactChild[]}) => {

    const snackbar = useSnackbar()

    const defaultProvider = new providers.JsonRpcProvider(ACTIVE_NETWORK.CHAIN_RPC)

    const [status, setStatus] = useState<CHAIN_STATUS>("NOT_CONNECTED");
    const [web3Provider, setWeb3Provider] = useState<providers.Web3Provider>();
    const [signer, setSigner] = useState<any>(defaultProvider);
    const [account, setAccount] = useState<string>();
    const [defoInstance, setDefoInstance] = useState();

    const switchNetwork = async () => {
        const AVALANCHE_MAINNET_PARAMS = {
            chainId: hexValue(ACTIVE_NETWORK.CHAIN_ID),
            chainName: ACTIVE_NETWORK.CHAIN_NAME,
            nativeCurrency: NATIVE_CURRENCY,
            rpcUrls: [ACTIVE_NETWORK.CHAIN_RPC],
            blockExplorerUrls: [ACTIVE_NETWORK.CHAIN_EXPLORER]
        }

        if (web3Provider?.provider?.request) {

            try {
                await web3Provider.provider.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: AVALANCHE_MAINNET_PARAMS.chainId }]
                })
                console.log("switch")
            } catch (error) {
                console.log("switch error")
                console.log(error)
            }

            try {
                await web3Provider.provider.request({
                    method: 'wallet_addEthereumChain',
                    params: [AVALANCHE_MAINNET_PARAMS]
                })
                console.log("add")
            } catch (error) {
                console.log("add error")
                console.log(error)
            }
        }
    }


    const connect = async () => {
        try {
            if (typeof window !== "undefined") {
                const providerOptions: IProviderOptions = {
                    walletconnect: {
                        package: WalletConnectProvider,
                        options: {
                            infuraId: INFURA_ID,
                            rpc: RPC,
                            chainId: ACTIVE_NETWORK.CHAIN_ID
                        },
                    },
                }

                const web3Modal: Web3Modal = new Web3Modal({
                    theme: theme,
                    cacheProvider: false,
                    providerOptions,
                });

                web3Modal.clearCachedProvider();
                const provider = await web3Modal.connect();                
                const web3Provider = new providers.Web3Provider(provider, "any");
                const signer = web3Provider.getSigner();
                const accounts = await web3Provider.listAccounts();
                
                // console.log('signer: ', signer);
                // console.log('accounts: ', accounts);
                
                const net = await web3Provider.getNetwork()
                console.log('net: ', net);
                

                setWeb3Provider(web3Provider);
                setAccount(accounts[0]);

                if (net.chainId === ACTIVE_NETWORK.CHAIN_ID) {
                    setSigner(signer);
                    setStatus("CONNECTED")
                    snackbar.execute("Success", "success")
                } else {
                    setSigner(defaultProvider)
                    setStatus("DIFFERENT_CHAIN")
                    snackbar.execute(`Please Switch To ${ACTIVE_NETWORK.CHAIN_NAME}`, "warning")
                }


                provider.on("chainChanged", async (chainId: number) => {

                    console.log(chainId);
                    console.log(provider)
                    const web3Provider = new providers.Web3Provider(
                        provider
                    );

                    const net = await web3Provider.getNetwork()

                    if (net.chainId === ACTIVE_NETWORK.CHAIN_ID) {

                        setSigner(signer);
                        setStatus("CONNECTED")
                        snackbar.execute("Success", "success")

                    } else {

                        setSigner(defaultProvider)
                        setStatus("DIFFERENT_CHAIN")
                        snackbar.execute(`Please Switch To ${ACTIVE_NETWORK.CHAIN_NAME}`, "warning")

                    }


                });

            }
        } catch (error) {
            console.log(error)
            setAccount(undefined);
            setSigner(defaultProvider)
            snackbar.execute("Wallet Connection Error", "warning")
        }
    };

    return (
        <Web3Context.Provider
            value={{
                status,
                connect,
                signer,
                account,
                switchNetwork,
            }}
        >
            {children}
        </Web3Context.Provider>
    );
};


const useWeb3 = (): IWeb3Context => {
    const context = useContext(Web3Context);
    if (!context) {
        throw new Error(`Cannot use the Web3 Context`);
    }
    return context;
};


export { Web3Provider, useWeb3 }