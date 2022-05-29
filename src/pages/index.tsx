//  @ts-nocheck
import { Box, Button, Container, FormControlLabel, Grid, IconButton, Modal, Paper, Switch, Tooltip, Typography, useTheme } from '@mui/material'
import type { NextPage } from 'next'
import Footer from 'components/Footer'
import { CONTRACTS, GemType, GemTypeMetadata } from "shared/utils/constants"
import { BigNumber, Contract, ethers } from 'ethers'
import { useWeb3 } from 'shared/context/Web3/Web3Provider'
import { useEffect, useState } from 'react'
import Navbar from 'components/Navbar'
import Head from 'next/head'
import { Close, HelpOutline, SafetyDividerOutlined } from '@mui/icons-material'
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { formatUnits } from 'ethers/lib/utils'
import ContentBox from 'components/ContentBox'
import DonationsBox from 'components/DonationsBox'
import YieldGems from "components/YieldGems/YieldGems";
import P2VaultBox from 'components/P2VaultBox'
import moment from 'moment'
import { useSnackbar } from 'shared/context/Snackbar/SnackbarProvider'
import { useDiamondContext } from 'shared/context/DiamondContext/DiamondContextProvider'
import { getGemTypes } from 'shared/utils/format'
import { getIsEligableForClaim } from 'shared/utils/helper'

type yieldGemsMetadataType = {
	gem0: GemTypeMetadata | {},
	gem1: GemTypeMetadata | {},
	gem2: GemTypeMetadata | {},
}

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

	const [meta, setMeta] = useState<any>()

	const [selectedVaultStrategy, setSelectedVaultStrategy] = useState(20)
	const [vaultStrategyEnabled, setVaultStrategyEnabled] = useState(false)


	// initialize DiamondContract
	useEffect(() => {

		(async () => {
			try {
				const mainContract = new Contract(CONTRACTS.Main.address, CONTRACTS.Main.abi, signer)
				// console.log('mainContract: ', mainContract);

				if (mainContract.address) {
					setDiamondContract(mainContract)
				}

				const meta = await mainContract.getMeta()
				setMeta(meta)

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
		// console.log('GEM 0: ', yieldGemsMetadata.gem0);
		// console.log(myGems);

	}, [yieldGemsMetadata.gem0])

	useEffect(() => {
		// console.log('myGems: ', myGems);
		// console.log('Meta: ', meta);
	}, [myGems])

	const fetchAccountData = async () => {
		const contract = new Contract(CONTRACTS.Main.address, CONTRACTS.Main.abi, signer)


		setYourDonations(ethers.utils.formatEther(await contract.getTotalCharity(account))) // put in the vault or claim reward
		setYourStake(await contract.showStakedAmount())

		//fetch gemMetadata
		const _gem0Metadata = await diamondContract.GetGemTypeMetadata(0);
		const _gem1Metadata = await diamondContract.GetGemTypeMetadata(1);
		const _gem2Metadata = await diamondContract.GetGemTypeMetadata(2);

		setYieldGemsMetadata({
			gem0: getGemTypes(_gem0Metadata),
			gem1: getGemTypes(_gem1Metadata),
			gem2: getGemTypes(_gem2Metadata)
		})

		const myGemIds = await contract.getGemIdsOf(account)

		const myGems: GemType[] = await Promise.all(myGemIds.map(async (gemId: BigNumber) => {

			const gem = await contract.GemOf(gemId)
			const pendingReward: BigNumber = await contract.checkTaxedReward(gemId)

			let gemTyped: GemType = {
				id: gemId.toString(),
				MintTime: gem[0],
				LastReward: gem[1],
				LastMaintained: gem[2],
				GemType: gem[3],
				TaperCount: gem[4],
				Booster: gem[5],
				claimedReward: gem[7],
				pendingReward: pendingReward,
			}

			return gemTyped
		}))
		setMyGems(myGems)
	}

	const getDefoReward = () => {
		return formatUnits(myGems.reduce((n, { pendingReward }) => pendingReward.add(n), BigNumber.from(0)), "ether")
	}

	const getIsTooSoon = async() => { 
		// const blockNumber = signer.provider
		// if(!signer && !signer?.provider) { return; }
		const provider = signer 
		// console.log('provider: ', signer.provider);
	}

	const payFee = async (gemId: string) => {
		console.log(gemId);
		const isEligable = await getIsEligableForClaim(diamondContract, signer.provider);

		if(!isEligable) { 
			snackbar.execute("You already paid the fee", "error");
			return
		}
		
		// const contract = new Contract(CONTRACTS.Main.address, CONTRACTS.Main.abi, signer)
		// "Error: VM Exception while processing transaction: reverted with panic code 0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)"

		try {
			const tx = await diamondContract.Maintenance(gemId, 0)
			snackbar.execute("Maintenance on progress, please wait.", "info")
			await tx.wait()
			await fetchAccountData()

		} catch (error: any) {
			console.log(error)
			snackbar.execute(error?.error?.message || error?.data?.message || error?.reason || "ERROR", "error")
		}

	}

	const batchPayFee = async (gemIds: string[]) => {
		console.log(gemIds);
		
		// const contract = new Contract(CONTRACTS.Main.address, CONTRACTS.Main.abi, signer)

		// try {
		// 	const tx = await contract.BatchMaintenance(gemIds)
		// 	snackbar.execute("Maintenance on progress, please wait.", "info")
		// 	await tx.wait()
		// 	await fetchAccountData()

		// } catch (error: any) {
		// 	console.log(error)
		// 	snackbar.execute(error?.error?.message || error?.reason || "ERROR", "error")
		// }

	}

	const claimRewards = async (gemId: string) => {
		const contract = new Contract(CONTRACTS.Main.address, CONTRACTS.Main.abi, signer)
		try {
			const tx = await contract.ClaimRewards(gemId)
			snackbar.execute("Claiming on progress, please wait.", "info")
			await tx.wait()
			await fetchAccountData()

		} catch (error: any) {
			console.log(error)
			snackbar.execute(error?.error?.message || error?.reason || "ERROR", "error")
		}
	}

	const BatchClaimRewards = async (gemIds: string[]) => {
		// const contract = new Contract(CONTRACTS.Main.address, CONTRACTS.Main.abi, signer)
		const gemIdsAsNumber = gemIds.map(gemId => +gemId);
		console.log(gemIdsAsNumber);
		

		try {
			const batchTx = await diamondContract.BatchMaintenance(gemIdsAsNumber);
			console.log('batchTx: ', batchTx);
			const tx = await diamondContract.BatchClaimRewards(gemIdsAsNumber)
			snackbar.execute("Claiming on progress, please wait.", "info")
			await tx.wait()
			await fetchAccountData()
			setClaimRewardsModalOpen(false)

		} catch (error: any) {
			console.log(error)
			snackbar.execute(error?.error?.message || error?.data?.message || error?.reason || "ERROR", "error")
		}
	}


	const BatchAddToVault = async (gemIds: string[]) => {

		const contract = new Contract(CONTRACTS.Main.address, CONTRACTS.Main.abi, signer)
		try {

			let amounts = []

			if (vaultStrategyEnabled) {
				for (const myGem of myGems) {
					let amount = myGem.pendingReward.div(100).mul(selectedVaultStrategy)
					amounts.push(amount)
				}
			} else {
				for (const myGem of myGems) {
					let amount = myGem.pendingReward
					amounts.push(amount)
				}

			}

			const tx = await contract.batchAddTovault(gemIds, amounts)
			snackbar.execute("Claiming on progress, please wait.", "info")
			await tx.wait()
			await fetchAccountData()
			setClaimRewardsModalOpen(false)

		} catch (error: any) {
			console.log(error)
			snackbar.execute(error?.error?.message || error?.data?.message || error?.reason || "ERROR", "error")
		}
	}


	const columns: GridColDef[] = [
		{
			flex: 1,
			field: 'name',
			headerName: 'Name',
			renderCell: (params) => {
				const gem: GemType = params.row;
				if (gem.GemType === 0) {
					return "Sapphire"
				} else if (gem.GemType === 1) {
					return "Ruby"
				} else if (gem.GemType === 2) {
					return "Diamond"
				}
			}
		},
		{
			flex: 1,
			field: 'created',
			headerName: 'Created',
			renderCell: (params) => {
				const gem: GemType = params.row;
				return moment(gem.MintTime, "X").format("MMM DD YYYY HH:mm")
			}
		},
		{
			flex: 1,
			field: 'rewards',
			headerName: 'Rewards',
			renderCell: (params) => {
				const gem: GemType = params.row;
				return `${formatUnits(gem.pendingReward, "ether")} DEFO`
			}
		},
		{
			flex: 0.8,
			field: 'taxTier',
			headerName: 'Tax Tier'
		},
		{
			flex: 1,
			field: 'tierCountdown',
			headerName: 'Tier Countdown'
		},
		{
			flex: 1,
			field: 'feesDueIn',
			headerName: 'Fees due in',
			renderCell: (params) => {
				const gem: GemType = params.row;
				return <Typography variant='body2'>{moment(gem.LastMaintained, "X").format("MMM DD YYYY HH:mm")}</Typography>
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
					onClick={async () => {
						setSelectedRows([])
						await payFee(row.id)
					}}
					variant="contained"
					color="primary"
					sx={{
						marginLeft: {
							xs: theme.spacing(0),
							md: theme.spacing(2)
						},
						marginRight: theme.spacing(1),

					}}>PAY FEE</Button>
				<Button
					onClick={() => {
						setSelectedRows([row.id])
						setClaimRewardsModalOpen(true)
					}}
					variant="outlined"
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

	return (
		<Box>
			<Head>
				<title>DEFO</title>
				<meta name="viewport" content="initial-scale=1.0, width=device-width" />
			</Head>
			<Navbar />
			<Container>
				<Button onClick={getIsTooSoon} variant="outlined" color="error">Get Info</Button>
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
						<YieldGems myGems={myGems} fetchAccountData={fetchAccountData} />
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
						/>
					</Grid>

					<Grid item xs={12} md={3.75}>
						<ContentBox
							title="Rewards"
							color="#FCBD00"
							button={<Button
								// onClick={() => {
								// 	BatchClaimRewards(myGems.map(gem => gem.id))
								// }}
								onClick={() => setClaimRewardsModalOpen(true)}
								disabled={status !== "CONNECTED"}
								variant="contained"
								color="info"
							>
								OPEN CLAIM
							</Button>}
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
											{getDefoReward()} DEFO
										</Typography>
										<Typography variant="h5" fontWeight={"bold"}>
											(${(+getDefoReward()) * 5})
										</Typography>
									</Paper>
								</Grid>
							</Grid>
						</ContentBox>
					</Grid>

				</Grid>

				{/* Table */}
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
							<Button
								disabled={status !== "CONNECTED" || selectedRows.length === 0}
								onClick={() => batchPayFee(selectedRows)}
								variant="contained"
								color="primary"
								sx={{

									marginLeft: {
										xs: theme.spacing(0),
										md: theme.spacing(2)
									},
									marginRight: theme.spacing(1),

								}}>PAY FEES</Button>
						</Grid>
						<Grid item>
							<Button
								disabled={status !== "CONNECTED" || selectedRows.length === 0}
								onClick={
									() => setClaimRewardsModalOpen(true)
								}
								variant="outlined"
								sx={{
									color: "white",
									borderColor: "white",
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
							rows={myGems}
							columns={columns}
							pageSize={5}
							rowsPerPageOptions={[5]}
							checkboxSelection
							hideFooterSelectedRowCount
							selectionModel={selectedRows}
							onSelectionModelChange={(newSelection: any) => {
								console.log("newSelection", newSelection)
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
												formatUnits(
													myGems
														.filter(gem => selectedRows.includes(gem.id))
														.reduce(
															(
																n,
																{ pendingReward }
															) => pendingReward.add(n),
															BigNumber.from(0)
														), "ether"
												)
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
									<Tooltip title="Lorem Ipsum">
										<Button
											variant="contained"
											color="primary"
											endIcon={<HelpOutline />}
											onClick={() => BatchClaimRewards(selectedRows)}
											sx={{
												marginLeft: {
													xs: theme.spacing(0),
													md: theme.spacing(2)
												},
												marginRight: theme.spacing(1),

											}}>CLAIM</Button>
									</Tooltip>
									<Tooltip title="Lorem Ipsum">

										<Button
											onClick={() => BatchAddToVault(selectedRows)}
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
									</Tooltip>
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
											formatUnits(
												myGems
													.filter(gem => selectedRows.includes(gem.id))
													.reduce(
														(
															n,
															{ pendingReward }
														) => (pendingReward.div(100).mul(meta[3])).add(n),
														BigNumber.from(0)
													), "ether")
										} DEFO ($0)</Typography>
									</Grid>
								</Grid>
								<Grid container justifyContent={"space-between"} >
									<Grid item>
										<Typography fontWeight={"bold"} variant="body2">CLAIM TAX:</Typography>
									</Grid>
									<Grid item>
										<Typography variant="body2">1 DEFO ($0)</Typography>
									</Grid>
								</Grid>
							</Grid>
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
								</Box>

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
