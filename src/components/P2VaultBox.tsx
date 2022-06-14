import { Close, HelpOutline } from "@mui/icons-material"
import { Box, Button, Grid, IconButton, LinearProgress, Modal, Paper, Tooltip, Typography, useTheme } from "@mui/material"
import { DataGrid, GridColDef, GridRowId } from "@mui/x-data-grid"
import { BigNumber, ethers } from "ethers"
import { formatUnits } from "ethers/lib/utils"
import moment from "moment"
import { useEffect, useState } from "react"
import { GemType } from "shared/utils/constants";
import ContentBox from "./ContentBox"
import { useWeb3 } from "shared/context/Web3/Web3Provider"
import { formatNumber } from "shared/utils/format"
import { useDiamondContext } from "shared/context/DiamondContext/DiamondContextProvider"
import { useSnackbar } from "shared/context/Snackbar/SnackbarProvider"




const P2VaultBox = ({
    totalStaked,
    yourStake,
    myGems,
    fetchAccountData
}: {
    totalStaked: BigNumber,
    yourStake: BigNumber,
    myGems: GemType[],
    fetchAccountData: Function
}) => {
    const theme = useTheme()
    const { status, account } = useWeb3()

    const [withdrawModalOpen, setWithdrawModalOpen] = useState(false)
    const { diamondContract } = useDiamondContext()
    const snackbar = useSnackbar()

    const withdraw = async (gem: GemType) => {
        // console.log('gem: ', gem);
        if (!isGemWithdrawable(gem)) {
            console.log('Not allowed!');
            return;
        }

        console.log('allowed');
        console.log(gem.id, gem.vaultAmount);
        // 99642
        // 118.68
        
        try {
            const tx = await diamondContract.removeFromVault(gem.id, gem.vaultAmount);
            snackbar.execute("Withdrawing from the vault on progress, please wait.", "info")
            await tx.wait()
            await fetchAccountData()
        } catch (error) {
            console.log('error on withdraw: ', error);
            snackbar.execute("Error occured while withdrawing from the vault", "error")
        }
    }

    const isGemWithdrawable = (gem: GemType) => {
        return !(gem.vaultAmount && !+ethers.utils.formatEther(gem.vaultAmount));
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
                return `${formatNumber(+formatUnits(gem.vaultAmount ? gem.vaultAmount : 0, "ether"))} DEFO`
            }
        },
        {
            flex: 1.5,
            field: 'payClaim',
            headerName: 'Withdraw',
            minWidth: 200,
            renderCell: (params) => <Box>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => withdraw(params.row)}
                    sx={{
                        marginLeft: {
                            xs: theme.spacing(0),
                            md: theme.spacing(2)
                        },
                        marginRight: theme.spacing(1),

                    }}>Withdraw</Button>
            </Box>
        },
    ]


    return (
        <>
            <ContentBox
                title="P2 Vault"
                color="#FCBD00"
                button={
                    <Tooltip title="Lorem Ipsum">
                        <span>
                            <Button
                                onClick={() => setWithdrawModalOpen(true)}
                                disabled={status !== "CONNECTED"}
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
                            <Typography sx={{ margin: theme.spacing(1, 0) }} variant="h4" fontWeight={"600"}>{formatNumber(+formatUnits(yourStake, "ether"))}</Typography>
                            <Box sx={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between"
                            }}>

                                <Typography
                                    sx={{
                                        fontSize: "12px",
                                    }}
                                >Your % staked</Typography>

                                <Typography
                                    sx={{
                                        fontSize: "12px",
                                    }}
                                >45%</Typography>


                            </Box>
                            <LinearProgress sx={{
                                marginTop: theme.spacing(1)
                            }} color='info' variant="determinate" value={45} />
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
                            <Typography sx={{ margin: theme.spacing(1, 0) }} variant="h4" fontWeight={"600"}>{formatNumber(+formatUnits(totalStaked, "ether"))}</Typography>
                            <Box sx={{
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
                            }} color='warning' variant="determinate" value={65} />
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
                                rows={myGems}
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