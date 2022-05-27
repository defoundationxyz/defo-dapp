import { BigNumber } from "ethers";

export const getBalance = (balance: BigNumber, decimals = 18) => Number(balance.div(BigNumber.from(10).pow(decimals)));

export const getHoursFromSecondsInRange = (number: number) => {
	const seconds = Math.round(number / 100) * 100;
	const hours = Math.floor(seconds / 3600);
	return hours;
}