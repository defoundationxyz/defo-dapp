// @ts-nocheck
import '../globals.css'
import type { AppProps } from 'next/app'
import ThemeProvider from "shared/styles/ThemeProvider/ThemeProvider";
import { Web3Provider } from 'shared/context/Web3/Web3Provider'
import { SnackbarProvider } from 'shared/context/Snackbar/SnackbarProvider'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <SnackbarProvider>
        <Web3Provider theme='dark'>
          <Component {...pageProps} />
        </Web3Provider>
      </SnackbarProvider>
    </ThemeProvider>
  )
}

export default MyApp
