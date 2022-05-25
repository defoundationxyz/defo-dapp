import { BigNumber } from "ethers";

export const getBalance = (balance: BigNumber, decimals = 18) => Number(balance.div(BigNumber.from(10).pow(decimals)));