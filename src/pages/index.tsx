import { Box, Button, Container, FormControlLabel, Grid, IconButton, Modal, Paper, Switch, Tooltip, Typography, useTheme } from '@mui/material'
import type { NextPage } from 'next'
import Footer from 'components/Footer'
import { CONTRACTS, GemType, GemTypeMetadata, TAX_TIER_MAPPER } from "shared/utils/constants"
import { BigNumber, Contract, ethers } from 'ethers'
import { useWeb3 } from 'shared/context/Web3/Web3Provider'
import { useEffect, useState } from 'react'
import Navbar from 'components/Navbar'
import Head from 'next/head'
import { Close, FormatUnderlinedTwoTone, HelpOutline, SafetyDividerOutlined } from '@mui/icons-material'
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { formatUnits } from 'ethers/lib/utils'
import ContentBox from 'components/ContentBox'
import DonationsBox from 'components/DonationsBox'
import YieldGems from "components/YieldGems/YieldGems";
import P2VaultBox from 'components/P2VaultBox'
import moment from 'moment'
import { useSnackbar } from 'shared/context/Snackbar/SnackbarProvider'
import { useDiamondContext } from 'shared/context/DiamondContext/DiamondContextProvider'
import { formatNumber, getGemTypes } from 'shared/utils/format'
import { getIsEligableForClaim } from 'shared/utils/helper'
import { getHoursFromSecondsInRange } from "shared/utils/format";
import { Gem, GemsConfigState, GemTypeConfig, ProtocolConfig } from 'shared/types/DataTypes'
import { getMaxAge } from 'next/dist/server/image-optimizer'

type yieldGemsMetadataType = {
	gem0: GemTypeMetadata | {},
	gem1: GemTypeMetadata | {},
	gem2: GemTypeMetadata | {},
}

const initialGemConfigState: GemTypeConfig = {
	maintenanceFeeDai: BigNumber.from(0),
	rewardAmountDefo: BigNumber.from(0),
	price: [BigNumber.from(0), BigNumber.from(0)],
	taperRewardsThresholdDefo: BigNumber.from(0),
	maxMintsPerLimitWindow: BigNumber.from(0),
	isMintAvailable: false
}

const initialProtocolConfigState: ProtocolConfig = {
	paymentTokens: [],
	wallets: [],
	incomeDistributionOnMint: [],
	maintenancePeriod: 0,
	rewardPeriod: 0,
	taxScaleSinceLastClaimPeriod: 0,
	taxRates: [],
	charityContributionRate: BigNumber.from(0),
	vaultWithdrawalTaxRate: BigNumber.from(0),
	taperRate: BigNumber.from(0),
	mintLock: true,
	transferLock: true,
	mintLimitWindow: 0,
}

// TODO: Create STATS hook

const Home: NextPage = () => {

	const theme = useTheme()
	const snackbar = useSnackbar()

	const { status, account, signer } = useWeb3()

	const { setDiamondContract, diamondContract } = useDiamondContext()

	const [selectedRows, setSelectedRows] = useState<string[]>([])

	const [claimRewardsModalOpen, setClaimRewardsModalOpen] = useState(false)

	const [yourDonations, setYourDonations] = useState<BigNumber>(BigNumber.from(0))
	const [totalDonations, setTotalDonations] = useState<BigNumber>(BigNumber.from(0))

	const [yourStake, setYourStake] = useState<BigNumber>(BigNumber.from(0))
	const [totalStaked, setTotalStaked] = useState<BigNumber>(BigNumber.from(0))

	const [myGems, setMyGems] = useState<GemType[]>([])
	const [yieldGemsMetadata, setYieldGemsMetadata] = useState<yieldGemsMetadataType>({
		gem0: {},
		gem1: {},
		gem2: {},
	});

	const [myCurrentGems, setMyCurrentGems] = useState<Gem[]>([])
	const [gemsConfig, setGemsConfig] = useState<GemsConfigState>({
		gem0: initialGemConfigState,
		gem1: initialGemConfigState,
		gem2: initialGemConfigState,
	})
	const [protocolConfig, setProtocolConfig] = useState<ProtocolConfig>()
	// const [taxTiers, setTaxTiers] = useState({ 

	// })

	const [vaultAmounts, setVaultAmounts] = useState<BigNumber[]>([]);

	// const [meta, setMeta] = useState<any>()

	const [selectedVaultStrategy, setSelectedVaultStrategy] = useState(20)
	const [vaultStrategyEnabled, setVaultStrategyEnabled] = useState(false)

	// initialize DiamondContract
	useEffect(() => {
		(async () => {
			try {
				const mainContract = new Contract(CONTRACTS.Main.address, CONTRACTS.Main.abi, signer)

				if (mainContract.address) {
					setDiamondContract(mainContract)
				}

			} catch (error) {
				console.log(error)
			}
		})()

		return () => { }
	}, [signer])


	useEffect(() => {

		(async () => {
			if (status === "CONNECTED") {
				fetchAccountData()
			}
		})()

		return () => { }
	}, [status, account, signer])

	useEffect(() => {
		// console.log('my gems: ', myCurrentGems)
		// console.log('protocolConfig taxRates: ', protocolConfig?.taxRates)
	}, [myCurrentGems])

	const fetchAccountData = async () => {
		const totalStake = await diamondContract.getTotalStakedAllUsers();
		const pendingRewards = await diamondContract.getCumulatedReward()
		const userTotalDonated = await diamondContract.getTotalDonated()
		const allTotalDonated = await diamondContract.getTotalDonatedAllUsers()
		const currProtocolConfig: ProtocolConfig = await diamondContract.getConfig()
		const yourCurrStake = await diamondContract.getTotalStaked()
		// console.log('TAX RATES: ', protocolConfig?.taxRates);
		// protocolConfig?.taxRates.forEach(tax => console.log(tax.toString()))

		setYourDonations(userTotalDonated)
		setTotalDonations(allTotalDonated)
		setTotalStaked(totalStake)
		setYourStake(yourCurrStake)
		setProtocolConfig(currProtocolConfig)

		const gemsConfig = await diamondContract.getGemTypesConfig()
		let gem0Config: GemTypeConfig = gemsConfig[0]
		let gem1Config: GemTypeConfig = gemsConfig[1]
		let gem2Config: GemTypeConfig = gemsConfig[2]

		gem0Config = { ...gem0Config, isMintAvailable: await diamondContract.isMintAvailable(0) }
		gem1Config = { ...gem1Config, isMintAvailable: await diamondContract.isMintAvailable(1) }
		gem2Config = { ...gem2Config, isMintAvailable: await diamondContract.isMintAvailable(2) }

		setGemsConfig({
			gem0: gem0Config,
			gem1: gem1Config,
			gem2: gem2Config,
		})

		// const myCurrentGemIds = await diamondContract.getGemIds()
		// setMyCurrentGems(myCurrentGemIds)
		const gemsInfo = await diamondContract.getGemsInfo()
		const currentGems: Gem[] = []


		for (let i = 0; i < gemsInfo[0].length; i++) {
			const gemId: BigNumber = gemsInfo[0][i]
			const gemData = gemsInfo[1][i]
			const pendingMaintenanceFee = await diamondContract.getPendingMaintenanceFee(gemId)
			const taxTier = await diamondContract.getTaxTier(gemId)
			const rewardAmount = await diamondContract.getRewardAmount(gemId)
			const isClaimable = await diamondContract.isClaimable(gemId)
			const staked = await diamondContract.getStaked(gemId)

			const newGem: Gem = {
				id: gemId.toString(),
				gemTypeId: gemData.gemTypeId,
				booster: gemData.booster,
				mintTime: gemData.mintTime,
				boostTime: gemData.boostTime,
				lastRewardWithdrawalTime: gemData.lastRewardWithdrawalTime,
				lastMaintenanceTime: gemData.lastMaintenanceTime,
				pendingMaintenanceFee,
				taxTier,
				rewardAmount,
				isClaimable,
				staked
			}
			currentGems.push(newGem)
		}
		setMyCurrentGems(currentGems)
	}

	const getPendingRewardsForGems = (gemIds: any) => {
		return formatUnits(
			myGems
				.filter(gem => gemIds.includes(gem.id))
				.reduce(
					(
						n,
						{ pendingReward }
					) => pendingReward.add(n),
					BigNumber.from(0)
				), "ether"
		)
	}

	const handleBatchPayFee = async (gemIds: string[]) => {
		try {
			const gemIdsCollection = gemIds.map(gemId => +gemId);
			let areAllGemsEligableForClaim: boolean = true

			for (let i = 0; i < gemIdsCollection.length; i++) {
				const isClaimable = await diamondContract.isClaimable(gemIdsCollection[i])
				if (!isClaimable) {
					areAllGemsEligableForClaim = false
					throw new Error("Some of the selected gem is not claimable!")
				}
			}
			const tx = gemIdsCollection.length === 1 ? await diamondContract.Maintenance(gemIdsCollection[0], 0) : await diamondContract.BatchMaintenance(gemIdsCollection)
			snackbar.execute("Maintenance on progress, please wait.", "info")
			await tx.wait()
			snackbar.execute("Fees are paid successfully for the selected gems", "info")
			await fetchAccountData()
		} catch (error: any) {
			console.log(error)
			snackbar.execute(error?.data?.message || error?.message || error?.error?.message || error?.reason || "ERROR", "error")
		}
	}

	const handlePayFee = async (gemIds: string[]) => {
		const gemIdsAsNumber = gemIds.map(gem => +gem)
		const fee = ethers.utils.formatEther(
			myCurrentGems
				.filter(gem => selectedRows.includes(gem.id))
				.reduce(
					(
						n,
						{ pendingMaintenanceFee }
					) => pendingMaintenanceFee.add(n),
					BigNumber.from(0)
				))

		// const firstGemFee = ethers.utils.formatEther(myCurrentGems[0].pendingMaintenanceFee)
		// const secondGemFee = ethers.utils.formatEther(myCurrentGems[1].pendingMaintenanceFee)
		// console.log('firstGemFee: ', firstGemFee);
		// console.log('secondGemFee: ', secondGemFee);

		// 99722.5 - 15
		// 99707

		try {
			const tx = gemIdsAsNumber.length === 1 ? await diamondContract.maintain(gemIdsAsNumber[0]) : await diamondContract.batchMaintain(gemIdsAsNumber);
			console.log('maintain TX: ', tx);
		} catch (error: any) {
			console.log('ERROR while paying the fee');
			snackbar.execute(error?.data?.message || error?.message || error?.error?.message || error?.reason || "ERROR", "error")
		}
	}

	// regex to check if the error is 'Gem is deactivated' show message 'you have to pay the tax first'
	// regex to check if the error is 'Too soon'

	const handleBatchClaimRewards = async (gemIds: string[]) => {
		console.log('selectedRows: ', selectedRows)
		console.log('gemIds: ', gemIds)

		if (!areSelectedGemsClaimable()) {
			snackbar.execute("Selected gem/s are not eligable for claim yet or fee is not paid", "error");
			return
		}

		// check if fee's are paid => claimTX
		// const gemIdsAsNumber = gemInstancesCollection.map((item: GemType) => +item.id)
		const gemIdsAsNumber = gemIds.map(gem => +gem)

		try {
			// const batchTx = await diamondContract.batchMaintain(gemIdsAsNumber);
			// console.log('batchTx: ', batchTx);

			const tx = gemIdsAsNumber.length === 1 ? await diamondContract.claimReward(gemIdsAsNumber[0]) : await diamondContract.batchClaimReward(gemIdsAsNumber);
			snackbar.execute("Claiming on progress, please wait.", "info")
			await tx.wait()
			await fetchAccountData()
			setClaimRewardsModalOpen(false)
		} catch (error: any) {
			console.log(error)
			snackbar.execute(error?.data?.message || error?.message || error?.error?.message || error?.reason || "ERROR", "error")
		}
	}

	const handleAddToVault = async (gemIds: string[], vaultStrategyPercentage: number) => {
		if (!areSelectedGemsClaimable()) {
			snackbar.execute("Selected gem/s are not eligable for claim yet or fee is not paid", "error");
			return
		}
		// const selectedGems = myCurrentGems.filter()
		const selectedGems = myCurrentGems.filter(gem => gemIds.includes(gem.id))
		console.log('selectedGems: ', selectedGems);

		const gemIdsAsNumber = gemIds.map(gem => +gem)
		const gemAmounts = selectedGems.map((gem: Gem) => {
			const amount = gem.rewardAmount.div(100).mul(vaultStrategyPercentage)
			return amount
		})
		gemAmounts.forEach(amount => {
			console.log('AMOUNT: ', ethers.utils.formatEther(amount));
		})
		// console.log('gemAmounts: ', gemAmounts);
		// only batch
		try {
			const addToVaultTX = gemIdsAsNumber.length === 1 ? await diamondContract.stakeReward(gemIdsAsNumber[0], gemAmounts[0]) : await diamondContract.batchStakeReward(gemIdsAsNumber, gemAmounts);
			snackbar.execute("Adding to the vault on progress, please wait.", "info")
			addToVaultTX.wait()
			// if (vaultStrategyPercentage < 100) {
			// 	await handleBatchClaimRewards(gemIds)
			// }
			await fetchAccountData()
			setClaimRewardsModalOpen(false)
		} catch (error: any) {
			console.log(error)
			snackbar.execute(error?.error?.message || error?.data?.message || error?.reason || "ERROR", "error")
		}
	}

	const handlebatchAddToVault = async (gemIds: string[], vaultStrategyPercentage: number) => {
		const gemIdsCollection: any = [];
		const amountsCollection = [];
		if (!signer) { return }
		for (const gemId of gemIds) {
			// @ts-ignore
			const isGemEligable = await getIsEligableForClaim(diamondContract, signer.provider, gemId); //@ts-n

			if (!isGemEligable) {
				snackbar.execute("Selected gem/s are not eligable for claim yet", "error");
				return;
			}
			const gemInstance = myGems.find((gem: GemType) => gem.id === gemId);
			if (!gemInstance) { continue; }

			const amount = gemInstance.pendingReward.div(100).mul(vaultStrategyPercentage)
			amountsCollection.push(amount);

			gemIdsCollection.push(+gemInstance.id);
			// check via gemInstance.LastMaintained if the fee is paid, if not throw
		}

		amountsCollection.forEach((amount, index) => {
			console.log(`gem with ID: ${gemIdsCollection[index]} has amount for the vault: ${ethers.utils.formatEther(amount)}`);
		});
		// pay fee's first
		// const result = +getPendingRewardsForGems(gemIds);
		// console.log(result);

		// return
		try {
			const isSingleGem = gemIdsCollection.length === 1;
			console.log('gemIdsCollection: ', gemIdsCollection);
			console.log('amountsCollection: ', amountsCollection);

			const tx = isSingleGem
				? await diamondContract.addToVault(gemIdsCollection[0], amountsCollection[0])
				: await diamondContract.batchAddToVault(gemIdsCollection, amountsCollection);

			snackbar.execute("Providing to the vault on progress, please wait.", "info")
			await tx.wait()

			if (vaultStrategyPercentage < 100) {
				await handleBatchClaimRewards(gemIds)
			}
			await fetchAccountData()
			setClaimRewardsModalOpen(false)
		} catch (error) {
			console.log(error)
			// @ts-ignore
			snackbar.execute(error?.error?.message || error?.data?.message || error?.reason || "ERROR", "error")
		}
	}


	const columns: GridColDef[] = [
		{
			flex: 1,
			field: 'name',
			headerName: 'Name',
			renderCell: (params) => {
				const gem: Gem = params.row;
				if (gem.gemTypeId === 0) {
					return "Sapphire"
				} else if (gem.gemTypeId === 1) {
					return "Ruby"
				} else if (gem.gemTypeId === 2) {
					return "Diamond"
				}
			}
		},
		{
			flex: 1,
			field: 'created',
			headerName: 'Created',
			renderCell: (params) => {
				const gem: Gem = params.row;
				// return 'Mint Time'
				return moment(gem.mintTime, "X").format("MMM DD YYYY HH:mm")
			}
		},
		{
			flex: 1,
			field: 'rewards',
			headerName: 'Rewards',
			renderCell: (params) => {
				const gem: Gem = params.row;
				return (ethers.utils.formatEther(gem.rewardAmount) || 0).toString() + ' DEFO'
				// return `9999 DEFO` // gem.pendingReward
			}
		},
		{
			flex: 0.8,
			field: 'taxTier',
			headerName: 'Tax Tier',
			renderCell: (params) => {
				const gem: Gem = params.row;
				return (
					<Typography variant="body2">{TAX_TIER_MAPPER[gem.taxTier.toString()]}</Typography>
				)
			}
		},
		{
			flex: 1,
			field: 'tierCountdown',
			headerName: 'Next Tier',
			renderCell: (params) => {
				const gem: Gem = params.row;
				// const nextTier = moment(gem.nextTaxTier.toString(), "X").format("MMM DD YYYY HH:mm");
				// @ts-ignore
				// const nextTierValue = nextTier == 0 ? "No tax" : nextTier
				// return <Typography variant="body2">{nextTierValue}</Typography>
				return 'Next tier'
			}
		},
		{
			flex: 1,
			field: 'feesDueIn',
			headerName: 'Tax free after', // Fees due in
			renderCell: (params) => {
				const gem: Gem = params.row;
				return <Typography variant='body2'>{moment(gem.mintTime, "X").add('1', 'm').format("MMM DD YYYY HH:mm")}</Typography>
				// return <Typography variant='body2'>{moment(gem.LastMaintained, "X").format("MMM DD YYYY HH:mm")}</Typography>
			}
		},
		{
			flex: 1.5,
			field: 'payClaim',
			headerName: 'Pay/Claim',
			minWidth: 200,
			renderCell: ({ row }: { row: GemType }) => <Box sx={{
			}}>
				<Button
					onClick={() => {
						setSelectedRows([row.id])
						setClaimRewardsModalOpen(true)
					}}
					variant="contained"
					color="primary"
					// disabled={row.isEligableForClaim}
					sx={{
						color: "white",
						borderColor: "white",
						"&:hover": {
							color: "gray",
							borderColor: "gray",
						}
					}}>CLAIM</Button>
			</Box>
		},
	]

	useEffect(() => {
		// console.log('selected rows: ', selectedRows)
	}, [selectedRows])

	const areSelectedGemsClaimable = () => {
		return myCurrentGems
			.filter(gem => selectedRows.includes(gem.id))
			.some(gem => gem.isClaimable)
	}

	const calculateTaxTier = (gemIds: string[]) => {
		// const amount = gemInstance.pendingReward.div(100).mul(vaultStrategyPercentage)
		const result = ethers.utils.formatEther(
			myCurrentGems
				.filter(gem => selectedRows.includes(gem.id))
				.reduce(
					(
						n,
						{ rewardAmount, taxTier }
					) => {
						if (taxTier === 0) {
							return BigNumber.from(0)
						}
						// @ts-ignore
						const taxTierPercentage = +(protocolConfig?.taxRates[taxTier].toString()) / 100
						// console.log('taxTierPercentage: ', taxTierPercentage)
						const calculatedAmount = rewardAmount.div(100).mul(taxTierPercentage)
						// console.log('calculatedAmount: ', ethers.utils.formatEther(calculatedAmount));
						return n.add(calculatedAmount)
					},
					BigNumber.from(0)
				))

		// console.log('result: ', result);
		return (<>123 </>)
	}

	return (
		<Box>
			<Head>
				<title>DEFO</title>
				<meta name="viewport" content="initial-scale=1.0, width=device-width" />
			</Head>
			<Navbar />
			<Container>
				<Typography variant="h4" fontWeight={"bold"}>
					Welcome Philanthropist!
				</Typography>
				<Typography variant='body1' color={"gray"}>
					Ready to make the world a better place for the less fortunate?
				</Typography>

				{/* Donations */}
				<Grid
					container
					justifyContent={"space-between"}
					sx={{
						margin: theme.spacing(8, 0),
					}}
				>
					<Grid item xs={12} md={5.8}>
						<DonationsBox
							yourDonations={yourDonations}
							totalDonations={totalDonations}
						/>
					</Grid>

					<Grid item xs={12} md={5.8}>
						<YieldGems myGems={myCurrentGems} gemsConfig={gemsConfig} fetchAccountData={fetchAccountData} />
					</Grid>
				</Grid>

				{/* P2 Vault */}
				<Grid
					container
					justifyContent={"space-between"}
				>
					<Grid item xs={12} md={7.9}>
						<P2VaultBox
							totalStaked={totalStaked}
							yourStake={yourStake}
							myGems={myGems}
							fetchAccountData={fetchAccountData}
						/>
					</Grid>

					<Grid item xs={12} md={3.75}>
						<ContentBox
							title="Rewards"
							color="#FCBD00"
						>
							<Grid
								container
								justifyContent={"space-between"}
							>
								<Grid item xs={12}>
									<Paper
										sx={{
											padding: {
												xs: theme.spacing(2),
												md: theme.spacing(2, 4)
											},
										}}>
										<Typography variant="body2">PENDING REWARDS</Typography>
										<Typography sx={{ margin: theme.spacing(1, 0) }} variant="h4" fontWeight={"600"}>
											{(+ethers.utils.formatEther(
												myCurrentGems.reduce(
													(n, { rewardAmount }) => rewardAmount.add(n),
													BigNumber.from(0))
											)
											).toFixed(3)}
										</Typography>
										<Typography variant="h5" fontWeight={"bold"}>
											{/* (${(+getDefoReward()) * 5}) */}
											$0.00
										</Typography>
									</Paper>
								</Grid>
							</Grid>
						</ContentBox>
					</Grid>

				</Grid>

				{/* GEM Table */}
				<Box
					sx={{
						margin: theme.spacing(8, 0)
					}}
				>

					<Grid container alignItems={"center"}>
						<Grid item xs={12} md="auto" >
							<Typography>{selectedRows?.length || 0} nodes selected</Typography>
						</Grid>
						<Grid item>
						</Grid>
						<Grid item>
							<Button
								disabled={status !== "CONNECTED" || selectedRows.length === 0}
								onClick={
									() => setClaimRewardsModalOpen(true)
								}
								variant="contained"
								color="primary"
								sx={{
									color: "white",
									borderColor: "white",
									marginLeft: theme.spacing(1),
									"&:hover": {
										color: "gray",
										borderColor: "gray",
									}
								}}>CLAIM REWARDS</Button>
						</Grid>
					</Grid>


					<Box sx={{
						height: "400px",
						marginTop: theme.spacing(2)
					}}>
						<DataGrid
							rows={myCurrentGems}
							columns={columns}
							pageSize={5}
							rowsPerPageOptions={[5]}
							checkboxSelection
							hideFooterSelectedRowCount
							selectionModel={selectedRows}
							onSelectionModelChange={(newSelection: any) => {
								setSelectedRows(newSelection);
							}}
							disableSelectionOnClick
							rowHeight={59}
							sx={{
								border: "none",
								".MuiDataGrid-columnHeaders": {
									border: "none"
								},
								".MuiDataGrid-virtualScrollerContent": {
									backgroundColor: "rgba(255,255,255,0.05)",
									borderRadius: "10px"
								},
								"& .Mui-checked": {
									color: "#2EBE73 !important",
								}
							}}
						/>
					</Box>

				</Box>

			</Container >
			<Footer />

			<Modal
				open={claimRewardsModalOpen}
				onClose={() => setClaimRewardsModalOpen(false)}
				sx={{
					display: "flex",
					flexDirection: "row",
					justifyContent: "center",
					alignItems: "center",
					height: "100vh"
				}}
				BackdropProps={{
					sx: {
						backdropFilter: "blur(3px)",
						backgroundColor: 'rgba(0,0,30,0.4)'
					}
				}}
			>
				<Paper
					sx={{
						display: "flex",
						flexDirection: "column",
						minHeight: "50%",
						width: {
							xs: "90%",
							md: "55%"
						},
						backgroundColor: "#1f1d2b",
						padding: theme.spacing(4),
						position: "relative",
						overflow: "hidden",
						outline: 0,
						border: "solid 1px rgba(255,255,255,0.1)",
						borderRadius: "20px"
					}}>
					<IconButton
						onClick={() => setClaimRewardsModalOpen(false)}
						sx={{
							position: "absolute",
							right: 0,
							top: 0,
							backgroundColor: theme.palette.primary.main,
							"&:hover": {
								backgroundColor: theme.palette.primary.dark,
							},
							borderTopLeftRadius: 0,
							borderBottomLeftRadius: 0,
							borderBottomRightRadius: 0,
							borderTopRightRadius: "10%"
						}}>
						<Close />
					</IconButton>
					<ContentBox
						title="Claim Rewards"
						color='#03AC90'
					>
						<Grid
							container
							justifyContent={"space-between"}
							alignItems="center"
						>
							<Grid item xs={12} md={5.5}>
								<Typography variant='body1'>PENDING REWARDS</Typography>
								<Grid container alignItems="center" >
									<Grid item>
										<Typography
											variant='h4'
											fontWeight={"500"}
											sx={{
												marginRight: theme.spacing(1)
											}}>
											{
												ethers.utils.formatEther(
													myCurrentGems
														.filter(gem => selectedRows.includes(gem.id))
														.reduce(
															(
																n,
																{ rewardAmount }
															) => rewardAmount.add(n),
															BigNumber.from(0)
														))
											} DEFO</Typography>
									</Grid>
									<Grid item>
										<Typography variant='h6' fontWeight={"500"}>($0)</Typography>
									</Grid>
								</Grid>
							</Grid>
							<Grid item xs={12} md={5.5}>
								<Box sx={{
								}}>
									{/* I AM HERE */}
									<Tooltip title="This will claim all pending rewards to your wallet.">
										<span>
											<Button
												variant="contained"
												color="primary"
												endIcon={<HelpOutline />}
												onClick={() => handleBatchClaimRewards(selectedRows)}
												// disabled={areSelectedGemsClaimable()}
												sx={{
													marginLeft: {
														xs: theme.spacing(0),
														md: theme.spacing(2)
													},
													marginRight: theme.spacing(1),

												}}>CLAIM</Button>
										</span>
									</Tooltip>

									<Tooltip title="This will send all pending rewards to the Vault. Withdrawing from the Vault to your wallet has a fee.">
										<span>
											<Button
												onClick={() => handleAddToVault(selectedRows, 100)}
												// disabled={+getPendingRewardsForGems(selectedRows) <= 0 ? true : false}
												variant="outlined"
												endIcon={<HelpOutline />}
												sx={{
													color: "white",
													borderColor: "white",
													"&:hover": {
														color: "gray",
														borderColor: "gray",
													}
												}}>VAULT</Button>
										</span>
									</Tooltip>


									<Button
										onClick={() => handlePayFee(selectedRows)}
										// disabled={+getPendingRewardsForGems(selectedRows) <= 0 ? true : false}
										variant="contained"
										color="secondary"
										fullWidth
										sx={{
											mt: 2,
											backgroundColor: "#FCBD00",
											"&:hover": {
												backgroundColor: "#b58802",
											}
										}}
									>
										Pay fee
									</Button>
								</Box>
							</Grid>
							<Grid item xs={12} md={5} sx={{
								margin: theme.spacing(4, 0),
							}} >
								<Grid container justifyContent={"space-between"}  >
									<Grid item>
										<Typography fontWeight={"bold"} variant="body2">CHARITY TAX:</Typography>
									</Grid>
									<Grid item>
										<Typography variant="body2">{
											ethers.utils.formatEther(myCurrentGems
												.filter(gem => selectedRows.includes(gem.id))
												.reduce(
													(
														n,
														{ rewardAmount }
													) => rewardAmount.add(n),
													BigNumber.from(0)
												).div(100).mul(5))
										} DEFO ($0)</Typography>
									</Grid>
								</Grid>
								<Grid container justifyContent={"space-between"} >
									<Grid item>
										<Typography fontWeight={"bold"} variant="body2">Maintenance FEE:</Typography>
									</Grid>
									<Grid item>
										<Typography variant="body2">
											{
												ethers.utils.formatEther(
													myCurrentGems
														.filter(gem => selectedRows.includes(gem.id))
														.reduce(
															(
																n,
																{ pendingMaintenanceFee }
															) => pendingMaintenanceFee.add(n),
															BigNumber.from(0)
														))
											} DAI ($0)
										</Typography>
									</Grid>
								</Grid>
								<Grid container justifyContent={"space-between"} >
									<Grid item>
										<Typography fontWeight={"bold"} variant="body2">TAX TIER:</Typography>
									</Grid>
									<Grid item>
										<Typography variant="body2">
											{
												ethers.utils.formatEther(
													myCurrentGems
														.filter(gem => selectedRows.includes(gem.id))
														.reduce(
															(
																n,
																{ rewardAmount, taxTier }
															) => {
																if (taxTier === 0) {
																	return BigNumber.from(0)
																}
																// @ts-ignore
																const taxTierPercentage = +(protocolConfig?.taxRates[taxTier].toString()) / 100
																// console.log('taxTierPercentage: ', taxTierPercentage)
																const calculatedAmount = rewardAmount.div(100).mul(taxTierPercentage)
																// console.log('calculatedAmount: ', ethers.utils.formatEther(calculatedAmount));
																return n.add(calculatedAmount)
															},
															BigNumber.from(0)
														))}
											<> DEFO ($0)</>
										</Typography>
									</Grid>
								</Grid>
								<hr />
								<Grid container justifyContent={"space-between"} >
									<Grid item>
										<Typography fontWeight={"bold"} variant="body2">TOTAL RECEIVE:</Typography>
									</Grid>
									<Grid item>
										<Typography variant="body2">
											0.0 DAI ($0)
										</Typography>
									</Grid>
								</Grid>
							</Grid>

							{/* Vault Strategy */}
							<Grid item xs={12} md={12}>

								<Box sx={{
									display: "flex",
									flexDirection: "row",
									alignItems: "center",
									marginBottom: theme.spacing(2)
								}}>
									<Tooltip title="Lorem Ipsum">
										<Typography variant="body1" sx={{ marginRight: theme.spacing(1) }}>VAULT STRATEGY</Typography>
									</Tooltip>
									<Tooltip title="Lorem Ipsum">
										<HelpOutline sx={{ marginRight: theme.spacing(4) }} />
									</Tooltip>
									<FormControlLabel
										onClick={() => setVaultStrategyEnabled(!vaultStrategyEnabled)}
										control={<Switch color='success' checked={vaultStrategyEnabled} value={vaultStrategyEnabled} />}
										label={vaultStrategyEnabled ? "On" : "Off"}
									/>
									<Tooltip title="This will determine the percentage of your pending rewards that goes to the Vault. The rest will be claimed and sent to your wallet.">
										<span>
											<Button
												onClick={() => handleAddToVault(selectedRows, selectedVaultStrategy)}
												disabled={!vaultStrategyEnabled}
												variant="outlined"
												endIcon={<HelpOutline />}
												color={vaultStrategyEnabled ? "info" : "primary"}
												sx={vaultStrategyEnabled ? {} : {
													color: "white",
													borderColor: "white",
													"&:hover": {
														color: "gray",
														borderColor: "gray",
													}
												}}>Hybrid Vault</Button>
										</span>
									</Tooltip>
								</Box>


								{/* percentage list */}
								<Grid
									container
									justifyContent={"space-between"}
								>
									<Grid item md={2.8}>
										<Button
											disabled={!vaultStrategyEnabled}
											fullWidth
											variant="outlined"
											onClick={() => setSelectedVaultStrategy(20)}
											color={selectedVaultStrategy === 20 ? "info" : "primary"}
											sx={selectedVaultStrategy === 20 ? {
												borderRadius: "10px",
												padding: theme.spacing(1, 2),
												borderWidth: "2px",
												"&:hover": {
													borderWidth: "2px"
												}
											} : {
												color: "white",
												borderColor: "white",
												borderRadius: "10px",
												padding: theme.spacing(1, 2),
												"&:hover": {
													color: "gray",
													borderColor: "gray",
												}
											}}>20%</Button>
									</Grid>

									<Grid item md={2.8}>
										<Button
											disabled={!vaultStrategyEnabled}
											fullWidth
											variant="outlined"
											onClick={() => setSelectedVaultStrategy(40)}
											color={selectedVaultStrategy === 40 ? "info" : "primary"}
											sx={selectedVaultStrategy === 40 ? {
												borderRadius: "10px",
												padding: theme.spacing(1, 2),
												borderWidth: "2px",
												"&:hover": {
													borderWidth: "2px"
												}
											} : {
												color: "white",
												borderColor: "white",
												borderRadius: "10px",
												padding: theme.spacing(1, 2),
												"&:hover": {
													color: "gray",
													borderColor: "gray",
												}
											}}>40%</Button>
									</Grid>

									<Grid item md={2.8}>
										<Button
											disabled={!vaultStrategyEnabled}
											fullWidth
											variant="outlined"
											onClick={() => setSelectedVaultStrategy(60)}
											color={selectedVaultStrategy === 60 ? "info" : "primary"}
											sx={selectedVaultStrategy === 60 ? {
												borderRadius: "10px",
												padding: theme.spacing(1, 2),
												borderWidth: "2px",
												"&:hover": {
													borderWidth: "2px"
												}
											} : {
												color: "white",
												borderColor: "white",
												borderRadius: "10px",
												padding: theme.spacing(1, 2),
												"&:hover": {
													color: "gray",
													borderColor: "gray",
												}
											}}>60%</Button>
									</Grid>

									<Grid item md={2.8}>
										<Button
											disabled={!vaultStrategyEnabled}
											fullWidth
											variant="outlined"
											onClick={() => setSelectedVaultStrategy(80)}
											color={selectedVaultStrategy === 80 ? "info" : "primary"}
											sx={selectedVaultStrategy === 80 ? {
												borderRadius: "10px",
												padding: theme.spacing(1, 2),
												borderWidth: "2px",
												"&:hover": {
													borderWidth: "2px"
												}
											} : {
												color: "white",
												borderColor: "white",
												borderRadius: "10px",
												padding: theme.spacing(1, 2),
												"&:hover": {
													color: "gray",
													borderColor: "gray",
												}
											}}>80%</Button>
									</Grid>

								</Grid>

							</Grid>

						</Grid>
					</ContentBox>

				</Paper>
			</Modal>
		</Box>


	)
}

export default Home
