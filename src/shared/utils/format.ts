import { BigNumber } from "ethers";
import { GemTypeMetadata } from "./constants";

export const getBalance = (balance: BigNumber, decimals = 18) => Number(balance.div(BigNumber.from(10).pow(decimals)));

export const getHoursFromSecondsInRange = (number: number) => {
	const seconds = Math.round(number / 100) * 100;
	const hours = Math.floor(seconds / 3600);
	return hours;
}

export const getGemTypes = (rawGemMetadata: any): GemTypeMetadata => {
	return {
		LastMint: rawGemMetadata[0],
		MaintenanceFee: rawGemMetadata[1],
		RewardRate: rawGemMetadata[2],
		DailyLimit: rawGemMetadata[3],
		MintCount: rawGemMetadata[4],
		DefoPrice: rawGemMetadata[5],
		StablePrice: rawGemMetadata[6],
	}
}