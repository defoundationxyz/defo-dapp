import { Close, HelpOutline } from "@mui/icons-material"
import { Paper, IconButton, Grid, Typography, Box, Tooltip, Button, FormControlLabel, Switch, Modal, useTheme } from "@mui/material"
import ContentBox from "components/ContentBox"
import { ethers, BigNumber } from "ethers"
import { useEffect, useMemo, useState } from "react"
import { useDiamondContext } from "shared/context/DiamondContext/DiamondContextProvider"
import { useGemsContext } from "shared/context/GemContext/GemContextProvider"
import { useSnackbar } from "shared/context/Snackbar/SnackbarProvider"
import { useStatsContext } from "shared/context/StatsContext/StatsContextProvider"
import { Gem } from "shared/types/DataTypes"


export const ClaimModal = ({ selectedRows, isOpen, closeModal }: { selectedRows: any, isOpen: boolean, closeModal: () => void }) => {
    const { gemsCollection, updateGemsCollection } = useGemsContext()
    const { diamondContract } = useDiamondContext()
    const {
        updateDonations, updateStake,
        protocolConfig
    } = useStatsContext()

    const snackbar = useSnackbar()
    const theme = useTheme()

    const [vaultStrategyEnabled, setVaultStrategyEnabled] = useState(false)
    const [selectedVaultStrategy, setSelectedVaultStrategy] = useState(20)
    const [values, setValues] = useState({
        pendingRewards: BigNumber.from(0),
        charityTax: BigNumber.from(0),
        tierTax: BigNumber.from(0),
        maintenanceFee: BigNumber.from(0),
        claimable: BigNumber.from(0)
    })

    useEffect(() => {
        // console.log('Re-render');
        // console.log('getPendingRewards: ', getPendingRewards);
    }, [selectedRows])

    // CORE
    const handlePayFee = async (gemIds: string[]) => {
        const gemIdsAsNumber = gemIds.map(gemId => +gemId)

        try {
            const tx = gemIdsAsNumber.length === 1 ? await diamondContract.maintain(gemIdsAsNumber[0]) : await diamondContract.batchMaintain(gemIdsAsNumber);
            snackbar.execute("Paying Maintenance Fee on progress, please wait.", "info")
            await tx.wait()
            await updateDonations()
            await updateGemsCollection()
            closeModal()
        } catch (error: any) {
            console.log('ERROR while paying the fee');
            snackbar.execute(error?.data?.message || error?.message || error?.error?.message || error?.reason || "ERROR", "error")
        }
    }

    const handleBatchClaimRewards = async (gemIds: string[]) => {
        if (!areSelectedGemsClaimable()) {
            snackbar.execute("Selected gem/s are not eligable for claim yet or fee is not paid", "error");
            return
        }

        const gemIdsAsNumber = gemIds.map(gemId => +gemId)

        try {
            const tx = gemIdsAsNumber.length === 1 ? await diamondContract.claimReward(gemIdsAsNumber[0]) : await diamondContract.batchClaimReward(gemIdsAsNumber);
            snackbar.execute("Claiming on progress, please wait.", "info")
            await tx.wait()
            await updateDonations()
            await updateGemsCollection()
            closeModal()
        } catch (error: any) {
            console.log(error)
            snackbar.execute(error?.data?.message || error?.message || error?.error?.message || error?.reason || "ERROR", "error")
        }
    }

    const handleAddToVaultStrategy = async (gemIds: string[], vaultStrategyPercentage: number) => {
        if (!areSelectedGemsClaimable()) {
            snackbar.execute("Selected gem/s are not eligable for claim yet or fee is not paid", "error");
            return
        }

        try {
            const gemIdsAsNumber = gemIds.map(gemId => +gemId)

            const addToVaultAndClaimTx = await diamondContract.batchStakeAndClaim(gemIdsAsNumber, vaultStrategyPercentage * 100);
            snackbar.execute("Adding to the vault on progress, please wait.", "info")
            await addToVaultAndClaimTx.wait()
            await updateDonations()
            await updateStake()
            await updateGemsCollection()
            closeModal()
        } catch (error: any) {
            console.log(error)
            snackbar.execute(error?.error?.message || error?.data?.message || error?.reason || "ERROR", "error")
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

            const addToVaultTx = await diamondContract.batchStakeReward(gemIdsAsNumber, gemAmounts);
            snackbar.execute("Adding to the vault on progress, please wait.", "info")
            await addToVaultTx.wait()
            await updateDonations()
            await updateStake()
            await updateGemsCollection()
            closeModal()
        } catch (error: any) {
            console.log(error)
            snackbar.execute(error?.error?.message || error?.data?.message || error?.reason || "ERROR", "error")
        }
    }


    // HELPERS
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

    const pendingRewards = useMemo(() => {
        return gemsCollection
            .filter((gem: Gem) => selectedRows.includes(gem.id))
            .reduce(
                (
                    n: BigNumber,
                    { rewardAmount }: Gem
                ) => {
                    return rewardAmount.add(n)
                },
                BigNumber.from(0)
            )
    }, [gemsCollection, selectedRows])

    const charityTax = useMemo(() => {
        return gemsCollection
            .filter((gem: Gem) => selectedRows.includes(gem.id))
            .reduce(
                (
                    n: BigNumber,
                    { rewardAmount }: Gem
                ) => rewardAmount.add(n),
                BigNumber.from(0)
            ).div(100).mul(5)
    }, [gemsCollection, selectedRows])

    const tierTax = useMemo(() => {
        return gemsCollection
            .filter((gem: Gem) => selectedRows.includes(gem.id))
            .reduce(
                (
                    n: BigNumber,
                    { rewardAmount, taxTier }: Gem
                ) => {
                    if (taxTier === 0) {
                        return n.add(BigNumber.from(0))
                    }
                    const taxTierPercentage = +(protocolConfig.taxRates[taxTier].toString()) / 100
                    const calculatedAmount = rewardAmount.div(100).mul(taxTierPercentage)
                    return n.add(calculatedAmount)
                },
                BigNumber.from(0)
            )
    }, [gemsCollection, selectedRows])

    const maintenanceFee = useMemo(() => {
        return gemsCollection
            .filter((gem: Gem) => selectedRows.includes(gem.id))
            .reduce(
                (
                    n: BigNumber,
                    { pendingMaintenanceFee }: Gem
                ) => pendingMaintenanceFee.add(n),
                BigNumber.from(0)
            )
    }, [gemsCollection, selectedRows])

    const claimableAmount = useMemo(() => {
        return pendingRewards.sub(tierTax.add(charityTax))
    }, [gemsCollection, selectedRows])

    return (
        <Modal
            open={isOpen}
            onClose={() => closeModal()}
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
                    onClick={() => closeModal()}
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
                            <Grid container alignItems="center">
                                <Grid item>
                                    <Typography
                                        variant='h4'
                                        fontWeight={"500"}
                                        sx={{
                                            marginRight: theme.spacing(1)
                                        }}>
                                        {ethers.utils.formatEther(pendingRewards)} DEFO</Typography>
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
                                <Tooltip title="All pending rewards will be claimed to your wallet after taxes are deducted.">
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

                                <Tooltip title="This will put all your available rewards in the Vault.">
                                    <span>
                                        <Button
                                            onClick={() => handleAddToVault(selectedRows, 100)}
                                            disabled={!areSelectedGemsClaimable()}
                                            variant="outlined"
                                            color={"info"}
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
                                        {ethers.utils.formatEther(maintenanceFee)} DAI
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
                                    <Typography variant="body2">{ethers.utils.formatEther(charityTax)} DEFO ($0)</Typography>
                                </Grid>
                            </Grid>

                            <Grid container justifyContent={"space-between"} >
                                <Grid item>
                                    <Typography fontWeight={"bold"} variant="body2">CLAIM TAX TIER:</Typography>
                                </Grid>
                                <Grid item>
                                    <Typography variant="body2">
                                        {ethers.utils.formatEther(tierTax)} DEFO ($0)
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
                                        {ethers.utils.formatEther(claimableAmount)} DEFO ($0)
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
                                {/* <Typography variant="body1" sx={{ marginRight: theme.spacing(1) }}>VAULT STRATEGY</Typography>
                                <Tooltip title="Vault Strategy is a way to put only specific amount to the P2 Vault">
                                    <HelpOutline sx={{ marginRight: theme.spacing(4) }} />
                                </Tooltip>
                                <FormControlLabel
                                    onClick={() => setVaultStrategyEnabled(!vaultStrategyEnabled)}
                                    control={<Switch color='success' checked={vaultStrategyEnabled} value={vaultStrategyEnabled} />}
                                    label={vaultStrategyEnabled ? "On" : "Off"}
                                /> */}
                                <Tooltip title="This will send the selected percentage towards the Vault and the rest will be claimed.">
                                        <Button
                                            onClick={() => handleAddToVaultStrategy(selectedRows, selectedVaultStrategy)}
                                            variant="outlined"
                                            endIcon={<HelpOutline />}
                                            color={"info"}
                                            sx={{
                                                padding: 1,
                                                borderWidth: "2px",
                                                width: "50%",
                                                // margin: '0 auto',
                                                // textAlign: 'center',
                                                "&:hover": {
                                                    borderWidth: "2px"
                                                }
                                            }}
                                        >Hybrid Vault</Button>
                                </Tooltip>
                            </Box>


                            {/* percentage list */}
                            <Grid
                                container
                                justifyContent={"space-between"}
                            >
                                <Grid item md={2.8}>
                                    <Button
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
    )
}