import { Close, HelpOutline } from "@mui/icons-material"
import { Box, Button, Grid, IconButton, Modal, Paper, Tooltip, Typography, useTheme } from "@mui/material"
import { DataGrid, GridColDef } from "@mui/x-data-grid"
import { ethers } from "ethers"
import { useEffect, useMemo, useState } from "react"
import ContentBox from "./ContentBox"
import { useWeb3 } from "shared/context/Web3/Web3Provider"
import { useDiamondContext } from "shared/context/DiamondContext/DiamondContextProvider"
import { useSnackbar } from "shared/context/Snackbar/SnackbarProvider"
import { Gem } from "shared/types/DataTypes"
import { useStatsContext } from "shared/context/StatsContext/StatsContextProvider"
import { useGemsContext } from "shared/context/GemContext/GemContextProvider"
import { useChain } from 'react-moralis'
import { ACTIVE_NETOWORKS_COLLECTION } from "shared/utils/constants"


const P2VaultBox = () => {
    const theme = useTheme()
    const { status, isWeb3Enabled } = useWeb3()
    const { chainId } = useChain()

    const [vaultGems, setVaultGems] = useState<Gem[]>([])
    const [withdrawModalOpen, setWithdrawModalOpen] = useState(false)
    const { diamondContract } = useDiamondContext()
    const snackbar = useSnackbar()

    const { stake, updateStake, updateDonations } = useStatsContext()
    const { gemsCollection, updateGemsCollection } = useGemsContext()

    useEffect(() => {
        if (gemsCollection.length === 0) { return; }
        const filteredGems = gemsCollection.filter((gem: Gem) => !gem.staked.isZero())
        setVaultGems(filteredGems)
    }, [gemsCollection])

    const withdraw = async (gem: Gem) => {
        const stakedAmount = await diamondContract.getStaked(gem.id)

        try {
            const tx = await diamondContract.unStakeReward(gem.id, gem.staked);
            snackbar.execute("Withdrawing from the vault on progress, please wait.", "info")
            await tx.wait()
            await updateStake()
            await updateDonations()
            await updateGemsCollection()
        } catch (error) {
            console.log('error on withdraw: ', error);
            snackbar.execute("Error occured while withdrawing from the vault", "error")
        }
    }
    
    const columns = useMemo((): GridColDef[] => {
        return [
            {
                flex: 1,
                field: 'name',
                headerName: 'Gem Type',
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
                field: 'rewards',
                headerName: 'Staked Rewards',
                renderCell: (params) => {
                    const gem: Gem = params.row;
                    return `${(+ethers.utils.formatEther(gem.staked)).toFixed(3)} DEFO ($0.0)`
                }
            },
            {
                flex: 1,
                field: 'created',
                headerName: 'Withdrawable Amount',
                renderCell: (params) => {
                    const gem: Gem = params.row;
                    const WITHDRAW_VAULT_FEE_PERCENTAGE = 10
                    const amountToWithdraw = gem.staked.div(100).mul(WITHDRAW_VAULT_FEE_PERCENTAGE)
                    return <>{`${(+ethers.utils.formatEther(gem.staked.sub(amountToWithdraw))).toFixed(3)}`} DEFO ($0.0)</>
                }
            },
            {
                flex: 1.5,
                field: 'payClaim',
                headerName: 'Withdraw',
                minWidth: 200,
                renderCell: (params) => <Box>
                    <span>
                        <Button
                            onClick={() => withdraw(params.row)}
                            variant="contained"
                            color="primary"
                            sx={{
                                marginLeft: {
                                    xs: theme.spacing(0),
                                    md: theme.spacing(2)
                                },
                                marginRight: theme.spacing(1),
                            }}>Withdraw</Button>
                    </span>
                </Box>
            },
        ]
    }, [])


    return (
        <>
            <ContentBox
                title="P2 Vault"
                color="#FCBD00"
                button={
                    <Tooltip title="Withdraw will move your funds from the P2 Vault to the pending gem rewards.">
                        <span>
                            <Button
                                onClick={() => setWithdrawModalOpen(true)}
                                disabled={!(isWeb3Enabled || chainId && ACTIVE_NETOWORKS_COLLECTION.includes(parseInt(chainId, 16)))}
                                endIcon={<HelpOutline />}
                                variant="contained"
                                color="secondary"
                                sx={{
                                    backgroundColor: "#FCBD00",
                                    "&:hover": {
                                        backgroundColor: "#b58802",
                                    }
                                }}
                            >
                                WITHDRAW
                            </Button>
                        </span>
                    </Tooltip>
                }
            >
                <Grid
                    container
                    justifyContent={"space-between"}
                >
                    <Grid item xs={5.8}>
                        <Paper
                            sx={{
                                padding: {
                                    xs: theme.spacing(2),
                                    md: theme.spacing(2, 4)
                                },
                            }}>
                            <Typography variant="body2">YOUR STAKE</Typography>
                            <Typography
                                sx={{ margin: theme.spacing(1, 0) }}
                                variant="h4"
                                fontWeight={"600"}
                            >
                                {(+ethers.utils.formatEther(stake.userStake)).toFixed(3) || 0}
                            </Typography>
                        </Paper>
                    </Grid>


                    <Grid item xs={5.8}>
                        <Paper
                            sx={{
                                padding: {
                                    xs: theme.spacing(2),
                                    md: theme.spacing(2, 4)
                                },
                            }}>
                            <Typography variant="body2">TOTAL STAKED</Typography>

                            <Typography
                                sx={{ margin: theme.spacing(1, 0) }}
                                variant="h4"
                                fontWeight={"600"}
                            >
                                {(+ethers.utils.formatEther(stake.totalStake)).toFixed(3)}
                            </Typography>
                            {/* <Box sx={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between"
                            }}>

                                <Typography
                                    sx={{
                                        fontSize: "12px",
                                    }}
                                >Average % staked</Typography>

                                <Typography
                                    sx={{
                                        fontSize: "12px",
                                    }}
                                >65%</Typography>


                            </Box>
                            <LinearProgress sx={{
                                marginTop: theme.spacing(1)
                            }} color='warning' variant="determinate" value={65} /> */}
                        </Paper>
                    </Grid>
                </Grid>
            </ContentBox>

            <Modal
                open={withdrawModalOpen}
                onClose={() => setWithdrawModalOpen(false)}
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
                            md: "70%"
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
                        onClick={() => setWithdrawModalOpen(false)}
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
                        title="Withdraw"
                        color='#03AC90'
                    >
                        <Box sx={{
                            height: "400px",
                            marginTop: theme.spacing(2)
                        }}>
                            <DataGrid
                                rows={vaultGems}
                                columns={columns}
                                pageSize={5}
                                rowsPerPageOptions={[5]}
                                // checkboxSelection
                                hideFooterSelectedRowCount
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
                    </ContentBox>
                </Paper>
            </Modal>
        </>
    )
}

export default P2VaultBox