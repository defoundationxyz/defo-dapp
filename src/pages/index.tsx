import { Box, Button, Container, FormControlLabel, Grid, IconButton, Modal, Paper, Switch, Tooltip, Typography, useTheme } from '@mui/material'
import type { NextPage } from 'next'
import Footer from 'components/Footer'
import { ACTIVE_NETOWORKS_COLLECTION, GemTypeMetadata, TAX_TIER_MAPPER } from "shared/utils/constants"
import { BigNumber, ethers } from 'ethers'
import { useWeb3 } from 'shared/context/Web3/Web3Provider'
import { useState } from 'react'
import Navbar from 'components/Navbar'
import Head from 'next/head'
import { Close, HelpOutline } from '@mui/icons-material'
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import ContentBox from 'components/ContentBox'
import DonationsBox from 'components/DonationsBox'
import YieldGems from "components/YieldGems/YieldGems";
import P2VaultBox from 'components/P2VaultBox'
import moment from 'moment'
import { useSnackbar } from 'shared/context/Snackbar/SnackbarProvider'
import { useDiamondContext } from 'shared/context/DiamondContext/DiamondContextProvider'
import { Gem, GemTypeConfig, ProtocolConfig } from 'shared/types/DataTypes'
import { useStatsContext } from 'shared/context/StatsContext/StatsContextProvider'
import { useGemsContext } from 'shared/context/GemContext/GemContextProvider'
import { InvalidNetworkView } from 'components/InvalidNetworkView/InvalidNetworkView'
import { useChain } from 'react-moralis'


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


const Home: NextPage = () => {

	const theme = useTheme()
	const snackbar = useSnackbar()

	const { isWeb3Enabled } = useWeb3()
	const { chainId } = useChain()

	const { diamondContract } = useDiamondContext()

	const [selectedRows, setSelectedRows] = useState<string[]>([])

	const [claimRewardsModalOpen, setClaimRewardsModalOpen] = useState(false)

	const [selectedVaultStrategy, setSelectedVaultStrategy] = useState(20)
	const [vaultStrategyEnabled, setVaultStrategyEnabled] = useState(false)

	const { gemsCollection, updateGemsCollection } = useGemsContext()
	const {
		updateDonations, updateStake,
		protocolConfig
	} = useStatsContext()

	const handlePayFee = async (gemIds: string[]) => {
		const gemIdsAsNumber = gemIds.map(gemId => +gemId)

		try {
			const tx = gemIdsAsNumber.length === 1 ? await diamondContract.maintain(gemIdsAsNumber[0]) : await diamondContract.batchMaintain(gemIdsAsNumber);
			snackbar.execute("Paying Maintenance Fee on progress, please wait.", "info")
			await tx.wait()
			await updateDonations()
			await updateGemsCollection()
			setClaimRewardsModalOpen(false)
		} catch (error: any) {
			console.log('ERROR while paying the fee');
			snackbar.execute(error?.data?.message || error?.message || error?.error?.message || error?.reason || "ERROR", "error")
		}
	}

	const handleBatchClaimRewards = async (gemIds: string[]) => {
		// console.log('selectedRows: ', selectedRows)
		// console.log('gemIds: ', gemIds)

		if (!areSelectedGemsClaimable()) {
			snackbar.execute("Selected gem/s are not eligable for claim yet or fee is not paid", "error");
			return
		}

		// check if fee's are paid => claimTX
		// const gemIdsAsNumber = gemInstancesCollection.map((item: GemType) => +item.id)
		const gemIdsAsNumber = gemIds.map(gemId => +gemId)

		try {
			// const batchTx = await diamondContract.batchMaintain(gemIdsAsNumber);
			// console.log('batchTx: ', batchTx);

			const tx = gemIdsAsNumber.length === 1 ? await diamondContract.claimReward(gemIdsAsNumber[0]) : await diamondContract.batchClaimReward(gemIdsAsNumber);
			snackbar.execute("Claiming on progress, please wait.", "info")
			await tx.wait()
			await updateDonations()
			await updateGemsCollection()
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

		try {
			const selectedGems = gemsCollection.filter((gem: Gem) => gemIds.includes(gem.id))
			const gemIdsAsNumber = gemIds.map(gemId => +gemId)

			const gemAmounts = gemIds.map((gemId: string) => {
				const currentGem = selectedGems.find((gem: Gem) => gem.id === gemId)
				const amount = currentGem.rewardAmount.div(100).mul(vaultStrategyPercentage)
				return amount;
			})


			// // const addToVaultTX = gemIdsAsNumber.length === 1 ? await diamondContract.stakeReward(gemIdsAsNumber[0], gemAmounts[0]) : await diamondContract.batchStakeReward(gemIdsAsNumber, gemAmounts);
			const addToVaultTX = await diamondContract.batchStakeReward(gemIdsAsNumber, gemAmounts);
			snackbar.execute("Adding to the vault on progress, please wait.", "info")
			await addToVaultTX.wait()
			// if (vaultStrategyPercentage < 100) {
			// 	await handleBatchClaimRewards(gemIds)
			// }
			await updateDonations()
			await updateStake()
			await updateGemsCollection()
			setClaimRewardsModalOpen(false)
		} catch (error: any) {
			console.log(error)
			snackbar.execute(error?.error?.message || error?.data?.message || error?.reason || "ERROR", "error")
			// Error: VM Exception while processing transaction: reverted with reason string 'Not enough pending rewards'
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
				// console.log('GEM IN TABLE: ', gem);
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
			headerName: 'Maint. fee until', // Fees due in
			renderCell: (params) => {
				const gem: Gem = params.row;
				// return <Typography variant='body2'>{moment(gem.mintTime, "X").add('1', 'M').format("MMM DD YYYY HH:mm")}</Typography>
				return <Typography variant='body2'>{moment(gem.lastMaintenanceTime, "X").format("MMM DD YYYY HH:mm")}</Typography>
			}
		},
		{
			flex: 1.5,
			field: 'payClaim',
			headerName: 'Pay/Claim',
			minWidth: 200,
			renderCell: ({ row }: { row: Gem }) => <Box sx={{
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

	const areSelectedGemsClaimable = () => {
		return gemsCollection
			.filter((gem: Gem) => selectedRows.includes(gem.id))
			.some((gem: Gem) => gem.isClaimable)
	}

	const shouldSelectedGemsPayMaintFee = () => {
		return gemsCollection
			.filter((gem: Gem) => selectedRows.includes(gem.id))
			.some((gem: Gem) => gem.pendingMaintenanceFee.isZero())
	}

	const getTaxTier = () => {
		if (gemsCollection.length == 0) { return; }
		try {
			const selectedGems = gemsCollection.filter((gem: Gem) => selectedRows.includes(gem.id))
			if (selectedGems.length === 0) { return; }
			return ethers.utils.formatEther(selectedGems
				.reduce(
					(
						n: BigNumber,
						{ rewardAmount, taxTier }: Gem
					) => {
						if (taxTier === 0) {
							return n.add(BigNumber.from(0))
						}
						// @ts-ignore
						const taxTierPercentage = +(protocolConfig.taxRates[taxTier].toString()) / 100
						const calculatedAmount = rewardAmount.div(100).mul(taxTierPercentage)
						return n.add(calculatedAmount)
					},
					BigNumber.from(0)
				))
		} catch (error) {
			console.log('error while getTaxTier');
			console.log(error);
		}
		return ethers.utils.formatEther(BigNumber.from(0))
	}

	return (
		<Box height={"100%"}>
			<Head>
				<title>DEFO</title>
				<meta name="viewport" content="initial-scale=1.0, width=device-width" />
			</Head>
			<Navbar />
			{(chainId && ACTIVE_NETOWORKS_COLLECTION.includes(parseInt(chainId, 16))) ?
				<Container>
					<Typography variant="h4" fontWeight={"bold"}>
						Welcome Philanthropist!
					</Typography>
					<Typography variant='body1' color={"gray"}>
						Ready to make the world a better place for the less fortunate?
					</Typography>

					{diamondContract ?
						<>
							{/* Donations */}
							<Grid
								container
								justifyContent={"space-between"}
								sx={{
									margin: theme.spacing(8, 0),
								}}
							>
								<Grid item xs={12} md={5.8}>
									<DonationsBox />
								</Grid>

								<Grid item xs={12} md={5.8}>
									<YieldGems />
								</Grid>
							</Grid>

							{/* P2 Vault */}
							<Grid
								container
								justifyContent={"space-between"}
							>
								<Grid item xs={12} md={7.9}>
									<P2VaultBox />
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
													<Box display={"flex"} alignItems="center">
														<Typography sx={{ margin: theme.spacing(1, 0) }} variant="h4" fontWeight={"600"}>
															{(+ethers.utils.formatEther(
																gemsCollection.reduce(
																	(n: BigNumber, { rewardAmount }: Gem) => rewardAmount.add(n),
																	BigNumber.from(0))
															)
															).toFixed(3)}
														</Typography>
														<Typography ml={1} variant="h6">
															($0.00)
														</Typography>
													</Box>
													{/* <Typography variant="h5" fontWeight={"bold"}>
										$0.00
									</Typography> */}
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
											// disabled={status !== "CONNECTED" || selectedRows.length === 0}
											disabled={!((selectedRows.length !== 0 && chainId && ACTIVE_NETOWORKS_COLLECTION.includes(parseInt(chainId, 16))))}
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
										rows={gemsCollection}
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
						</>
						:
						<div>Please Connect using metamask</div>
					}
				</Container>
				:
				<InvalidNetworkView />

			}

			<Footer />

			{/* Claim Modal */}
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
													gemsCollection
														.filter((gem: Gem) => selectedRows.includes(gem.id))
														.reduce(
															(
																n: BigNumber,
																{ rewardAmount }: Gem
															) => {
																return rewardAmount.add(n)
															},
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
												disabled={!areSelectedGemsClaimable()}
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
												disabled={!areSelectedGemsClaimable()}
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
										disabled={shouldSelectedGemsPayMaintFee()}
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
										Pay Maintenance fee
									</Button>
								</Box>
								<Grid container justifyContent={"space-between"} mt={1} mb={-1}>
									<Grid item>
										<Typography fontWeight={"bold"} variant="body2">Maintenance FEE:</Typography>
									</Grid>
									<Grid item>
										<Typography variant="body2">
											{
												ethers.utils.formatEther(
													gemsCollection
														.filter((gem: Gem) => selectedRows.includes(gem.id))
														.reduce(
															(
																n: BigNumber,
																{ pendingMaintenanceFee }: Gem
															) => pendingMaintenanceFee.add(n),
															BigNumber.from(0)
														))
											} DAI
										</Typography>
									</Grid>
								</Grid>
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
											ethers.utils.formatEther(gemsCollection
												.filter((gem: Gem) => selectedRows.includes(gem.id))
												.reduce(
													(
														n: BigNumber,
														{ rewardAmount }: Gem
													) => rewardAmount.add(n),
													BigNumber.from(0)
												).div(100).mul(5))
										} DEFO ($0)</Typography>
									</Grid>
								</Grid>

								<Grid container justifyContent={"space-between"} >
									<Grid item>
										<Typography fontWeight={"bold"} variant="body2">CLAIM TAX TIER:</Typography>
									</Grid>
									<Grid item>
										<Typography variant="body2">
											{getTaxTier()} DEFO ($0)
										</Typography>
									</Grid>
								</Grid>
								<hr />
								<Grid container justifyContent={"space-between"} >
									<Grid item>
										<Typography fontWeight={"bold"} variant="body2">CLAIMABLE:</Typography>
									</Grid>
									<Grid item>
										<Typography variant="body2">
											0.0 DEFO ($0)
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
