// @ts-nocheck
import '../globals.css'
import type { AppProps } from 'next/app'
import ThemeProvider from "shared/styles/ThemeProvider/ThemeProvider";
import { Web3Provider } from 'shared/context/Web3/Web3Provider'
import { SnackbarProvider } from 'shared/context/Snackbar/SnackbarProvider'
import { DiamondContextProvider } from 'shared/context/DiamondContext/DiamondContextProvider';
import { GemContextProvider } from 'shared/context/GemContext/GemContextProvider';
import { StatsContextProvider } from 'shared/context/StatsContext/StatsContextProvider';

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <ThemeProvider>
            <DiamondContextProvider>
                <SnackbarProvider>
                    <Web3Provider theme='dark'>
                        <StatsContextProvider>
                            <GemContextProvider>
                                <Component {...pageProps} />
                            </GemContextProvider>
                        </StatsContextProvider>
                    </Web3Provider>
                </SnackbarProvider>
            </DiamondContextProvider>
        </ThemeProvider>
    )
}

export default MyApp
