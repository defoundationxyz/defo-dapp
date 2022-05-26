import { useContext, useState } from "react";
import GemContext from "./GemContext";


const GemContextProvider = ({ children }: { children: any}) => {

    const providerValue = {}

    return (
        <GemContext.Provider value={providerValue}>
            {children}
        </GemContext.Provider>
    );
}


const useGemContext = () => {
    const context = useContext(GemContext);

    if (context === undefined) {
        throw new Error('useGemContext must be used within a GemContextProvider!');
    }

    return context
}

export { GemContextProvider, useGemContext };
