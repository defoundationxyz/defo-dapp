import Web3Context from "./Web3Context";
import {
    ReactChild,
    useContext,
    useEffect,
    useState,
} from "react";
import { ethers, providers } from "ethers";
import { ACTIVE_NETWORK } from "shared/utils/constants";

import { useMoralis, useChain } from 'react-moralis'


const defaultProvider = new providers.JsonRpcProvider(ACTIVE_NETWORK.chainRPC)

const Web3Provider = ({ children }: { children: ReactChild | ReactChild[] }) => {
    const {
        account,
        isWeb3Enabled,
        isWeb3EnableLoading,
        enableWeb3,
        web3,
        user,
        Moralis,
        deactivateWeb3,
    } = useMoralis()

    const { switchNetwork, chainId, chain } = useChain()

    // TODO: set default provider
    const [provider, setProvider] = useState<ethers.providers.Provider>(defaultProvider)
    const [signer, setSigner] = useState<ethers.Signer | null>(null)

    // refresh handler
    useEffect(() => {
        if (isWeb3Enabled) {
            return
        }
        if (typeof window !== 'undefined' && window.localStorage.getItem('connected')) {
            connectWeb3()
        }
    }, [isWeb3Enabled])

    // deactivate web3 handler
    useEffect(() => {
        let unsubscribeOnAccountChange: any;

        if (isWeb3Enabled) {
            unsubscribeOnAccountChange = Moralis.onAccountChanged((account: any) => {
                console.log('onAccountChange: ', account);

                if (account == null) {
                    window.localStorage.removeItem('connected')
                    deactivateWeb3()
                }
            })
        }

        return () => {
            if (unsubscribeOnAccountChange) {
                unsubscribeOnAccountChange()
            }
        }
    }, [isWeb3Enabled])

    // activate web3 handler
    useEffect(() => {
        const setWeb3 = async () => {
            await changeSignerAndProvider()
            window.localStorage.setItem('connected', 'injected')
        }

        if (isWeb3Enabled) {
            setWeb3()
        }
    }, [isWeb3Enabled, account])

    // refresh on network change
    useEffect(() => {
        let currProvider: ethers.providers.Web3Provider;

        const networkCb = (newNetwork: any, oldNetwork: any) => {
            if (oldNetwork) {
                window.location.reload();
            }
        }
        
        if (window.ethereum) {
            currProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
            currProvider.on("network", networkCb);
        }

        return () => { 
            if(currProvider) { 
                console.log('UNSUB network');
                currProvider.off("network", networkCb)
            }
        }
    }, [])


    const connectWeb3 = async () => {
        await enableWeb3()
    }

    const changeChainTo = async (network: any) => {
        console.log('Trying to change the chain');
        // if (!(network.chainId in SUPPORTED_NETWORKS)) {
        //     console.log(`${network.chainId} Chain Not Supported!`)
        //     return null
        // }

        // try {
        //     await switchNetwork(network.chainIdHex)
        // } catch (error) {
        //     console.error(`${network.name} Chain Not Supported!`)
        // }
    }

    const changeSignerAndProvider = async () => {
        const moralisProvider: any = Moralis.provider
        const accountAddress: any = account
        const currChainId: any = chainId

        const newProvider = new ethers.providers.Web3Provider(moralisProvider)
        const newSigner = newProvider.getSigner(accountAddress)

        if (newProvider) {
            setProvider(newProvider)
        }

        if (newSigner) {
            setSigner(newSigner)
        }
    }

    // useEffect(() => {
    //     const load = async () => {
    //         // const chainId = await web3Provider?.getNetwork()
    //     }

    //     load()
    // }, [web3Provider])

    // useEffect(() => {

    //     const load = async () => {
    //         if (signer && status === "CONNECTED" && web3Provider) {
    //             const net = await web3Provider.getNetwork();

    //             const networkName = NETWORK_MAPPER[net.chainId];
    //             const currentConfig = SUPPORTED_NETWORKS[networkName];
    //             if (!currentConfig?.deployments) {
    //                 console.log('MISSING DEPLOYMENTS AT connectAccount');
    //                 return
    //             }
    //             const mainContract = new Contract(currentConfig.deployments?.diamond.address, currentConfig.deployments?.diamond.abi, signer)

    //             setDiamondContract(mainContract)
    //             setConfig(currentConfig);
    //         }
    //     }

    //     load()
    // }, [signer, web3Provider])

    // const switchNetwork = async (networkConfig: ConfigType) => {
    //     const AVALANCHE_MAINNET_PARAMS = {
    //         chainId: hexValue(ACTIVE_NETWORK.chainId),
    //         chainName: ACTIVE_NETWORK.chainName,
    //         nativeCurrency: NATIVE_CURRENCY,
    //         rpcUrls: [ACTIVE_NETWORK.chainRPC],
    //         blockExplorerUrls: [ACTIVE_NETWORK.chainExplorer]
    //     }

    //     let NETWORK_PARAMS = {
    //         chainId: hexValue(networkConfig.chainId),
    //         chainName: networkConfig.chainName,
    //         nativeCurrency: networkConfig.nativeCurrency,
    //         rpcUrls: [networkConfig.chainRPC],
    //         blockExplorerUrls: [networkConfig.chainExplorer]
    //     }


    //     if (web3Provider?.provider?.request) {

    //         try {
    //             await web3Provider.provider.request({
    //                 method: 'wallet_switchEthereumChain',
    //                 params: [{ chainId: NETWORK_PARAMS.chainId }]
    //             })
    //             console.log("switching to: ", networkConfig.chainId)
    //         } catch (error) {
    //             console.log("switch error")
    //             console.log(error)
    //         }

    //         try {
    //             await web3Provider.provider.request({
    //                 method: 'wallet_addEthereumChain',
    //                 params: [NETWORK_PARAMS]
    //             })
    //             console.log("adding network: ", networkConfig.chainId)
    //         } catch (error) {
    //             console.log("add error")
    //             console.log(error)
    //         }
    //     }
    // }

    // const connectAccount = async (provider: any) => {
    //     const newWeb3Provider = new providers.Web3Provider(provider, "any");
    //     // console.log('web3Modal provider: ', provider);
    //     // console.log('providers.web3Provider: ', web3Provider);
    //     // console.log('default provider: ', defaultProvider);

    //     const signer = newWeb3Provider.getSigner();
    //     const defaultSigner = defaultProvider.getSigner();
    //     const accounts = await newWeb3Provider.listAccounts();

    //     // console.log('signer: ', signer);
    //     // console.log('defaultSigner: ', defaultSigner);

    //     setWeb3Provider(newWeb3Provider);
    //     setAccount(accounts[0]);

    //     const net = await newWeb3Provider.getNetwork();
    //     // set config
    //     // const chainId = await web3Provider.getNetwork();
    //     const chainId: number = net.chainId;
    //     const networkName = NETWORK_MAPPER[chainId];
    //     const currentConfig = SUPPORTED_NETWORKS[networkName];
    //     if (!currentConfig?.deployments) {
    //         console.log('MISSING DEPLOYMENTS AT connectAccount');
    //         return
    //     }
    //     console.log('diamond address: ', currentConfig.deployments?.diamond.address);
    //     console.log('abi: ', currentConfig.deployments?.diamond.abi);

    //     const mainContract = new Contract(currentConfig.deployments?.diamond.address, currentConfig.deployments?.diamond.abi, signer)
    //     console.log('MAIN CONTRACT: ', mainContract);
    //     setDiamondContract(mainContract)
    //     setConfig(currentConfig);

    //     if (net.chainId in NETWORK_MAPPER && (net.chainId === 1337 || net.chainId === 43113)) {
    //         console.log('Setting signer...!');
    //         setSigner(signer);
    //         setStatus("CONNECTED")
    //         snackbar.execute("Success", "success")
    //     } else {
    //         setSigner(defaultProvider)
    //         setStatus("DIFFERENT_CHAIN")
    //         snackbar.execute(`Please Switch To ${ACTIVE_NETWORK.chainName}`, "warning")
    //     }

    // }

    // const connect = async () => {
    //     try {
    //         if (typeof window !== "undefined") {
    //             const providerOptions: IProviderOptions = {
    //                 walletconnect: {
    //                     package: WalletConnectProvider,
    //                     options: {
    //                         infuraId: INFURA_ID,
    //                         rpc: RPC,
    //                         chainId: ACTIVE_NETWORK.chainId
    //                     },
    //                 },
    //             }

    //             const web3Modal: Web3Modal = new Web3Modal({
    //                 theme: theme,
    //                 cacheProvider: false,
    //                 providerOptions,
    //             });

    //             web3Modal.clearCachedProvider();
    //             const provider = await web3Modal.connect();
    //             await connectAccount(provider);

    //             // listeners
    //             provider.on("chainChanged", async (chainId: number) => {
    //                 console.log('CHANGE CHAIN...');
    //                 console.log(chainId);
    //                 console.log(provider)

    //                 const web3Provider = new providers.Web3Provider(
    //                     provider
    //                 );

    //                 const net = await web3Provider.getNetwork()

    //                 if (net.chainId in NETWORK_MAPPER && (net.chainId === 1337 || net.chainId === 43113)) {
    //                     setSigner(signer);
    //                     setStatus("CONNECTED")
    //                     snackbar.execute("Success", "success")
    //                 } else {
    //                     setSigner(defaultProvider);
    //                     setStatus("DIFFERENT_CHAIN")
    //                     snackbar.execute(`Please Switch To ${ACTIVE_NETWORK.chainName}`, "warning")
    //                 }


    //                 // if (net.chainId === ACTIVE_NETWORK.chainId) {

    //                 //     setSigner(signer);
    //                 //     setStatus("CONNECTED")
    //                 //     snackbar.execute("Success", "success")
    //                 // } else {
    //                 //     setSigner(defaultProvider);
    //                 //     setStatus("DIFFERENT_CHAIN")
    //                 //     snackbar.execute(`Please Switch To ${ACTIVE_NETWORK.chainName}`, "warning")
    //                 // }
    //             });

    //             provider.on("accountsChanged", async (accounts: string[]) => {
    //                 console.log('---accountsChanged---');
    //                 connectAccount(provider)
    //             })

    //         }
    //     } catch (error) {
    //         console.log(error)
    //         setAccount(undefined);
    //         setSigner(defaultProvider)
    //         snackbar.execute("Wallet Connection Error", "warning")
    //     }
    // };

    return (
        <Web3Context.Provider
            value={{
                account,
                chainId: chainId ? parseInt(chainId) : null,
                chainIdHex: chainId,
                isWeb3Enabled,
                isWeb3EnableLoading,
                connectWeb3,
                signer,
                provider,
                changeChainTo,
            }}
        >
            {children}
        </Web3Context.Provider>
    );
};


const useWeb3 = (): any => {
    const context = useContext(Web3Context);
    if (!context) {
        throw new Error(`Cannot use the Web3 Context`);
    }
    return context;
};


export { Web3Provider, useWeb3 }