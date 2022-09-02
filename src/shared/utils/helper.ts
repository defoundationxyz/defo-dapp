import moment from "moment";
import { MIN_REWARD_TIME } from "./constants";

export async function getIsEligableForClaim(diamondContract: any, provider: any, gemId: number) {
	const gem = await diamondContract.GemOf(gemId);

	const blockNumber = await provider.getBlockNumber();
	const timestamp = await (await provider.getBlock(blockNumber)).timestamp
	const rewardPoints = timestamp - gem[1]; // in seconds - 86 400 => 1 day
	return rewardPoints > MIN_REWARD_TIME;
}

export const getNextTier = async (provider: any, lastMaintenanceTimestamp: any, mintTimestamp: any) => {
	const lastMaintenanceDate = moment(lastMaintenanceTimestamp, "X");
	const mintDate = moment(mintTimestamp, "X");
	const endOfMaintenanceDate = mintDate.clone().add(1, 'month')

	// console.log('endOfMaintenanceDate: ', endOfMaintenanceDate.format("MMM DD YYYY HH:mm"));

	const currBlock = await getCurrentBlock(provider);
	const todayDate = moment.unix(currBlock.timestamp)

	// const today_mint_diff = todayDate.diff(mintDate, "day")
	// console.log('today_mint_diff: ', today_mint_diff);
	if(todayDate.diff(mintDate, "day") < 7) { 
		console.log('In first week...');
		return null
	}

	let nextTierDate = lastMaintenanceDate.clone();
	let iterations = 0

	// console.log('mint date: ', mintDate.format("MMM DD YYYY HH:mm"));
	// console.log('todayDate: ', todayDate.format("MMM DD YYYY HH:mm"));

	while (nextTierDate.isBefore(todayDate)) {
		// console.log('Adding 1 week...');
		nextTierDate.add(1, 'week')
		iterations++;
	}
	// console.log('nextTierDate: ', nextTierDate.format("MMM DD YYYY HH:mm"));

	if (endOfMaintenanceDate.isBefore(nextTierDate)) {
		console.log("Next tier date passes Maintenance fee until");
		return null
	}

	const leftDays = nextTierDate.diff(todayDate, 'day')
	console.log('leftDays: ', leftDays);
	
	return leftDays + 1;
}

const getCurrentBlock = async (provider: any) => {
	return await provider.getBlock("latest");
}
