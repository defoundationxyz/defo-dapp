// @ts-nocheck
import '../globals.css'
import type { AppProps } from 'next/app'
import ThemeProvider from "shared/styles/ThemeProvider/ThemeProvider";
import { Web3Provider } from 'shared/context/Web3/Web3Provider'
import { SnackbarProvider } from 'shared/context/Snackbar/SnackbarProvider'
import { DiamondContextProvider } from 'shared/context/DiamondContext/DiamondContextProvider';
import { GemContextProvider } from 'shared/context/GemContext/GemContextProvider';

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <ThemeProvider>
            <DiamondContextProvider>
                <SnackbarProvider>
                    <Web3Provider theme='dark'>
                        <GemContextProvider>
                            <Component {...pageProps} />
                        </GemContextProvider>
                    </Web3Provider>
                </SnackbarProvider>
            </DiamondContextProvider>
        </ThemeProvider>
    )
}

export default MyApp
