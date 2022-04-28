
import { Alert, AlertColor, Snackbar } from '@mui/material'
import { createContext, ReactChild, useContext, useState } from 'react'



const SnackbarContext = createContext({
    execute: (message: string, severity: AlertColor) => { console.log(message, severity) }
});


const SnackbarProvider = ({ children }: { children: ReactChild }) => {

    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState("")
    const [severity, setSeverity] = useState<AlertColor>("info")

    const handleClose = () => {
        setOpen(false)
        setMessage("")
    }

    const execute = (message: string, severity: AlertColor) => {
        setMessage(message)
        setSeverity(severity)
        setOpen(true)
    }

    return (
        <SnackbarContext.Provider value={{
            execute,
        }} >
            {children}
            <Snackbar
                open={open}
                autoHideDuration={3000}
                onClose={handleClose}

            >
                <Alert variant="filled" onClose={handleClose} severity={severity}>
                    {message}
                </Alert>
            </Snackbar>
        </SnackbarContext.Provider>
    )
}



export const useSnackbar = () => useContext(SnackbarContext)

export default SnackbarProvider