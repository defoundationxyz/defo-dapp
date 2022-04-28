import '../globals.css'
import type { AppProps } from 'next/app'
import ThemeProvider from '../components/ThemeProvider'
import Web3Provider from '../components/Web3Provider'
import SnackbarProvider from '../components/SnackbarProvider'

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
