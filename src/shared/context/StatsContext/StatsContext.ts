import { BigNumber } from "ethers";
import { createContext } from "react";
import { StakeState, stateInit } from "./StatsContextProvider";

// type StatsContextType = {
//     stake: StakeState,
//     updateStake: () => void,
// }

const StatsContext = createContext<any>({});

export default StatsContext