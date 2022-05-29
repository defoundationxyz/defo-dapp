import { MIN_REWARD_TIME } from "./constants";

// checking if not "Too soon" claim
export async function getIsEligableForClaim(diamondContract: any, provider: any) {
    const gem0 = await diamondContract.GemOf(0);
    console.log(gem0);
	const blockNumber = await provider.getBlockNumber();
	const timestamp = await (await provider.getBlock(blockNumber)).timestamp
	const rewardPoints = timestamp - gem0[1]; // in seconds - 86 400 => 1 day

	console.log('rewardPoints: ', rewardPoints);
	console.log('gem last reward: ', gem0[1]);
	console.log('timestamp: ', timestamp);
	console.log('is eligable: ', rewardPoints > MIN_REWARD_TIME);

    return rewardPoints > MIN_REWARD_TIME;
}