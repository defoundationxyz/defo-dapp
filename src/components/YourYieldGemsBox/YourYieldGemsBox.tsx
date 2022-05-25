import { Close, FiberManualRecord } from "@mui/icons-material"
import { Box, Button, Grid, IconButton, Modal, Paper, Typography, useTheme } from "@mui/material"
import { Contract, ContractFactory } from "ethers"
import { formatUnits } from "ethers/lib/utils"
import moment from "moment"
import { useState } from "react"
import { CONTRACTS, GemType, GemTypeMetadata } from "shared/utils/constants"
import ContentBox from "../ContentBox"
import { useSnackbar } from "shared/context/Snackbar/SnackbarProvider"
import { useWeb3 } from "shared/context/Web3/Web3Provider"
import { getBalance } from "shared/utils/format"
import erc20ABI from "abi/ERC20ABI.json";


const YourYieldGemsBox = ({
    fetchAccountData,
    myGems,
    gem0Metadata,
    gem1Metadata,
    gem2Metadata,
    meta,
}: {
    fetchAccountData: Function,
    myGems: GemType[],
    gem0Metadata: GemTypeMetadata | undefined,
    gem1Metadata: GemTypeMetadata | undefined,
    gem2Metadata: GemTypeMetadata | undefined,
    meta: any | undefined

}) => {
    const theme = useTheme()
    const snackbar = useSnackbar()
    const { signer, status, account } = useWeb3()


    const [createYieldGemModalOpen, setCreateYieldGemModalOpen] = useState(false)

    // console.log(meta);
    

    const createYieldGem = async (gemType: 0 | 1 | 2) => {
        
        const contract = new Contract(CONTRACTS.Main.address, CONTRACTS.Main.abi, signer);
        // console.log(contract);
        
        const gemMetadata = await contract.GetGemTypeMetadata(0);
        console.log('gemMetadata: ', gemMetadata);
        return

        try {
            const tx = await contract.MintGem(gemType.toString())
            console.log('mint tx: ', tx);
            snackbar.execute("Creating, please wait.", "info")
            await tx.wait()
            await fetchAccountData()
            snackbar.execute("Created", "success")
            setCreateYieldGemModalOpen(false)
        } catch (error: any) {
            console.log(error)
            snackbar.execute(error?.reason || "Error", "error")
        }
    }

    const getAvailableGemsToBeMinted = (gemType: 0 | 1 | 2) => {
        let gemMetadata;
        if(gemType === 0) { 
            gemMetadata = gem0Metadata
        } else if(gemType === 1) { 
            gemMetadata = gem1Metadata
        } else if(gemType === 2) { 
            gemMetadata = gem2Metadata
        }
        if(!gemMetadata?.DailyLimit) { return 0; }
        // console.log("Daily Limit: ", gemMetadata?.DailyLimit);
        console.log("MintCount: ", gemMetadata?.MintCount);
        console.log('---------------------------');
        return gemMetadata?.DailyLimit - gemMetadata?.MintCount
    }

    return (
        <>
            <ContentBox
                title="Your Yield Gems"
                color="#C6E270"
                button={<Button
                    disabled={status !== "CONNECTED"}
                    onClick={() => setCreateYieldGemModalOpen(true)}
                    variant="contained"
                    color="secondary"
                    sx={{
                        backgroundColor: "#C6E270",
                        "&:hover": {
                            backgroundColor: "#7a8c42",
                        }
                    }}
                >
                    CREATE YIELD GEM
                </Button>}
            >
                <Grid
                    container
                    justifyContent={"space-between"}
                    sx={{
                        height: "100%"
                    }}
                >

                    <Grid item xs={3.5}>
                        <Paper
                            sx={{
                                padding: {
                                    xs: theme.spacing(0.5),
                                    md: theme.spacing(2),
                                },
                                height: "100%",
                                border: "solid 1px #3C88FD"
                            }}>
                            <Box sx={{
                                display: "flex",
                                alignItems: "center"
                            }}>
                                <FiberManualRecord sx={{
                                    marginRight: {
                                        xs: theme.spacing(0),
                                        md: theme.spacing(1),
                                    },
                                    fontSize: "16px",
                                    color: "#3C88FD"
                                }} />
                                <Typography variant="body2" fontWeight={"bold"} color="#3C88FD">Sapphire</Typography>
                            </Box>
                            <Typography sx={{ margin: theme.spacing(1, 0) }} variant="h4" fontWeight={"600"}>
                                {myGems.reduce((n, { GemType }) => GemType === 0 ? n + 1 : n, 0)}
                            </Typography>
                        </Paper>
                    </Grid>


                    <Grid item xs={3.5}>
                        <Paper
                            sx={{
                                padding: {
                                    xs: theme.spacing(0.5),
                                    md: theme.spacing(2),
                                },
                                height: "100%",
                                border: "solid 1px #E0115F"
                            }}>
                            <Box sx={{
                                display: "flex",
                                alignItems: "center"
                            }}>
                                <FiberManualRecord sx={{
                                    marginRight: {
                                        xs: theme.spacing(0),
                                        md: theme.spacing(1),
                                    },
                                    fontSize: "16px",
                                    color: "#E0115F"
                                }} />
                                <Typography variant="body2" fontWeight={"bold"} color="#E0115F">Ruby</Typography>
                            </Box>
                            <Typography sx={{ margin: theme.spacing(1, 0) }} variant="h4" fontWeight={"600"}>
                                {myGems.reduce((n, { GemType }) => GemType === 1 ? n + 1 : n, 0)}
                            </Typography>
                        </Paper>
                    </Grid>


                    
                    <Grid item xs={3.5}>
                        <Paper
                            sx={{
                                padding: {
                                    xs: theme.spacing(0.5),
                                    md: theme.spacing(2),
                                },
                                height: "100%",
                                border: "solid 1px #5DDAF6"
                            }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center"
                                }}>
                                <FiberManualRecord
                                    sx={{
                                        marginRight: {
                                            xs: theme.spacing(0),
                                            md: theme.spacing(1),
                                        },
                                        fontSize: "16px",
                                        color: "#5DDAF6"
                                    }} />
                                <Typography variant="body2" fontWeight={"bold"} color="#5DDAF6">Diamond</Typography>
                            </Box>
                            <Typography sx={{ margin: theme.spacing(1, 0) }} variant="h4" fontWeight={"600"}>
                                {myGems.reduce((n, { GemType }) => GemType === 2 ? n + 1 : n, 0)}
                            </Typography>
                        </Paper>
                    </Grid>

                </Grid>
            </ContentBox>

            <Modal
                open={createYieldGemModalOpen}
                onClose={() => setCreateYieldGemModalOpen(false)}
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100vh",
                }}
                BackdropProps={{
                    sx: {
                        backdropFilter: "blur(3px)",
                        backgroundColor: 'rgba(0,0,30,0.4)'
                    }
                }}
            >
                <Paper sx={{
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "50%",
                    minWidth: "65%",
                    maxHeight: "90vh",
                    maxWidth: "90vw",
                    backgroundColor: "#1f1d2b",
                    position: "relative",
                    overflow: "hidden",
                    outline: 0,
                    border: "solid 1px rgba(255,255,255,0.1)",
                    borderRadius: "20px"
                }}>
                    <IconButton
                        onClick={() => setCreateYieldGemModalOpen(false)}
                        sx={{
                            position: "absolute",
                            zIndex: 1,
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
                    <Box sx={{
                        overflow: "scroll",
                        padding: theme.spacing(4),
                    }}>
                        <ContentBox
                            title="Create Yield Gem"
                            color='#C6E270'
                        >
                            <Grid
                                container
                                justifyContent={"space-between"}
                                sx={{
                                    height: "100%"
                                }}
                            >
                                
                                <Grid item xs={12} md={3.7} sx={{
                                    margin: {
                                        xs: theme.spacing(2, 0),
                                        md: 0,
                                    },
                                }} >
                                    <Paper
                                        sx={{
                                            padding: {
                                                xs: theme.spacing(0.5),
                                                md: theme.spacing(2),
                                            },
                                            height: "100%",
                                            border: "solid 1px #3C88FD"
                                        }}>
                                        <Box sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            marginBottom: theme.spacing(2)

                                        }}>
                                            <FiberManualRecord sx={{
                                                marginRight: {
                                                    xs: theme.spacing(0),
                                                    md: theme.spacing(1),
                                                },
                                                fontSize: "16px",
                                                color: "#3C88FD"
                                            }} />
                                            <Typography variant="body2" fontWeight={"bold"} color="#3C88FD">Sapphire</Typography>
                                        </Box>
                                        <Box sx={{
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            margin: theme.spacing(0.5, 0)
                                        }}>
                                            <Typography variant="body2" fontWeight={"600"}>Cost:</Typography>
                                            <Typography variant="body2" >{gem0Metadata?.DefoPrice && formatUnits(gem0Metadata?.DefoPrice, "ether")} DEFO + {gem0Metadata?.StablePrice && formatUnits(gem0Metadata?.StablePrice, "ether")} DAI</Typography>
                                        </Box>
                                        <Box sx={{
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            margin: theme.spacing(0.5, 0)

                                        }}>
                                            <Typography variant="body2" fontWeight={"600"}>Reward:</Typography>
                                            <Typography variant="body2" >{gem0Metadata?.RewardRate.toString()}DEFO/Week</Typography>
                                        </Box>
                                        <Box sx={{
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            margin: theme.spacing(0.5, 0)
                                        }}>
                                            <Typography variant="body2" fontWeight={"600"}>Available:</Typography>
                                            <Typography variant="body2"> 
                                            {getAvailableGemsToBeMinted(0)}/{gem0Metadata?.DailyLimit.toString()} 
                                            </Typography>
                                        </Box>
                                        <Box sx={{
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            margin: theme.spacing(0.5, 0)
                                        }}>
                                            <Typography variant="body2" fontWeight={"600"}>Refresh:</Typography>
                                            <Typography variant="body2" > {meta && moment.duration(moment(meta[14], "X").diff(moment(gem0Metadata?.LastMint, "X"))).asHours()}H</Typography>
                                        </Box>
                                        <Button
                                            onClick={() => createYieldGem(0)}
                                            variant='contained'
                                            sx={{
                                                color: "white",
                                                backgroundColor: "#3C88FD",
                                                marginTop: theme.spacing(1),
                                                "&:hover": {
                                                    backgroundColor: "#2d66bd",
                                                }
                                            }}
                                        >CREATE</Button>
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} md={3.7} sx={{
                                    margin: {
                                        xs: theme.spacing(2, 0),
                                        md: 0,
                                    },
                                }} >
                                    <Paper
                                        sx={{
                                            padding: {
                                                xs: theme.spacing(0.5),
                                                md: theme.spacing(2),
                                            },
                                            height: "100%",
                                            border: "solid 1px #E0115F"
                                        }}>
                                        <Box sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            marginBottom: theme.spacing(2)

                                        }}>
                                            <FiberManualRecord sx={{
                                                marginRight: {
                                                    xs: theme.spacing(0),
                                                    md: theme.spacing(1),
                                                },
                                                fontSize: "16px",
                                                color: "#E0115F"
                                            }} />
                                            <Typography variant="body2" fontWeight={"bold"} color="#E0115F">Ruby</Typography>
                                        </Box>
                                        <Box sx={{
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            margin: theme.spacing(0.5, 0)
                                        }}>
                                            <Typography variant="body2" fontWeight={"600"}>Cost:</Typography>
                                            <Typography variant="body2" >{gem1Metadata?.DefoPrice && formatUnits(gem1Metadata?.DefoPrice, "ether")} DEFO + {gem1Metadata?.StablePrice && formatUnits(gem1Metadata?.StablePrice, "ether")} DAI</Typography>
                                        </Box>
                                        <Box sx={{
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            margin: theme.spacing(0.5, 0)

                                        }}>
                                            <Typography variant="body2" fontWeight={"600"}>Reward:</Typography>
                                            <Typography variant="body2" >{gem1Metadata?.RewardRate.toString()}DEFO/Week</Typography>
                                        </Box>
                                        <Box sx={{
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            margin: theme.spacing(0.5, 0)
                                        }}>
                                            <Typography variant="body2" fontWeight={"600"}>Available:</Typography>
                                            <Typography variant="body2" > {getAvailableGemsToBeMinted(1)}/{gem1Metadata?.DailyLimit.toString()}</Typography>
                                        </Box>
                                        <Box sx={{
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            margin: theme.spacing(0.5, 0)
                                        }}>
                                            <Typography variant="body2" fontWeight={"600"}>Refresh:</Typography>
                                            <Typography variant="body2" > {meta && moment.duration(moment(meta[14], "X").diff(moment(gem1Metadata?.LastMint, "X"))).asHours()}H</Typography>
                                        </Box>
                                        <Button
                                            onClick={() => createYieldGem(1)}
                                            variant='contained'
                                            sx={{
                                                color: "white",
                                                backgroundColor: "#E0115F",
                                                marginTop: theme.spacing(1),
                                                "&:hover": {
                                                    backgroundColor: "#9e0d44",
                                                }
                                            }}
                                        >CREATE</Button>
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} md={3.7} sx={{
                                    margin: {
                                        xs: theme.spacing(2, 0),
                                        md: 0,
                                    },
                                }} >
                                    <Paper
                                        sx={{
                                            padding: {
                                                xs: theme.spacing(0.5),
                                                md: theme.spacing(2),
                                            },
                                            height: "100%",
                                            border: "solid 1px #5DDAF6",
                                        }}>
                                        <Box sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            marginBottom: theme.spacing(2)

                                        }}>
                                            <FiberManualRecord sx={{
                                                marginRight: {
                                                    xs: theme.spacing(0),
                                                    md: theme.spacing(1),
                                                },
                                                fontSize: "16px",
                                                color: "#5DDAF6"
                                            }} />
                                            <Typography variant="body2" fontWeight={"bold"} color="#5DDAF6">Diamond</Typography>
                                        </Box>
                                        <Box sx={{
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            margin: theme.spacing(0.5, 0)
                                        }}>
                                            <Typography variant="body2" fontWeight={"600"}>Cost:</Typography>
                                            <Typography variant="body2" >{gem2Metadata?.DefoPrice && formatUnits(gem2Metadata?.DefoPrice, "ether")} DEFO + {gem2Metadata?.StablePrice && formatUnits(gem2Metadata?.StablePrice, "ether")} DAI</Typography>
                                        </Box>
                                        <Box sx={{
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            margin: theme.spacing(0.5, 0)

                                        }}>
                                            <Typography variant="body2" fontWeight={"600"}>Reward:</Typography>
                                            <Typography variant="body2" >{gem2Metadata?.RewardRate.toString()}DEFO/Week</Typography>
                                        </Box>
                                        <Box sx={{
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            margin: theme.spacing(0.5, 0)
                                        }}>
                                            <Typography variant="body2" fontWeight={"600"}>Available:</Typography>
                                            <Typography variant="body2" >{getAvailableGemsToBeMinted(2)}/{gem2Metadata?.DailyLimit.toString()}</Typography>
                                        </Box>
                                        <Box sx={{
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            margin: theme.spacing(0.5, 0)
                                        }}>
                                            <Typography variant="body2" fontWeight={"600"}>Refresh:</Typography>
                                            <Typography variant="body2" > {meta && moment.duration(moment(meta[14], "X").diff(moment(gem2Metadata?.LastMint, "X"))).asHours()}H</Typography>
                                        </Box>
                                        <Button
                                            onClick={() => createYieldGem(2)}
                                            variant='contained'
                                            sx={{
                                                color: "black",
                                                backgroundColor: "#5DDAF6",
                                                marginTop: theme.spacing(1),
                                                "&:hover": {
                                                    backgroundColor: "#45a5ba",
                                                }
                                            }}
                                        >CREATE</Button>
                                    </Paper>
                                </Grid>

                            </Grid>
                        </ContentBox>

                    </Box>
                </Paper>
            </Modal>
        </>
    )
}

export default YourYieldGemsBox