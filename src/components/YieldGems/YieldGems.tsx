import { Close, FiberManualRecord } from "@mui/icons-material"
import { Box, Button, Grid, IconButton, Modal, Paper, Typography, useTheme } from "@mui/material"
import { Contract, ContractFactory } from "ethers"
import { formatUnits } from "ethers/lib/utils"
import moment from "moment"
import { useRef, useState } from "react"
import { CONTRACTS, GemType, GemTypeMetadata } from "shared/utils/constants"
import ContentBox from "../ContentBox"
import { useSnackbar } from "shared/context/Snackbar/SnackbarProvider"
import { useWeb3 } from "shared/context/Web3/Web3Provider"
import { getBalance } from "shared/utils/format"
import erc20ABI from "abi/ERC20ABI.json";
import ModalLayout from "shared/components/DialogLayout/ModalLayout"
import YieldGemBox from "./YieldGemBox/YieldGemBox"


const YieldGems = ({
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
    const gemsModalRef = useRef<any>();
    const theme = useTheme();
    const snackbar = useSnackbar();
    const { signer, status, account } = useWeb3();

    const [yieldGems, setYieldGems] = useState({
        gem0Metadata: {},
        gem1Metadata: {},
        gem2Metadata: {},
    });

    const [createYieldGemModalOpen, setCreateYieldGemModalOpen] = useState(false);

    const handleOpenModal = () => {
        if (!gemsModalRef.current) { return; }
        gemsModalRef?.current?.handleOpen();
    }

    const handleCloseModal = () => {
        if (!gemsModalRef.current) { return; }
        gemsModalRef?.current?.handleClose();
    }


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
        if (gemType === 0) {
            gemMetadata = gem0Metadata
        } else if (gemType === 1) {
            gemMetadata = gem1Metadata
        } else if (gemType === 2) {
            gemMetadata = gem2Metadata
        }
        if (!gemMetadata?.DailyLimit) { return 0; }
        return gemMetadata?.DailyLimit - gemMetadata?.MintCount - 1 // TOOD: fix this in the smart contract
    }

    return (
        <>
            <ContentBox
                title="Your Yield Gems"
                color="#C6E270"
                button={<Button
                    // disabled={status !== "CONNECTED"}
                    onClick={handleOpenModal}
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

            <ModalLayout
                ref={gemsModalRef}
            >

                <Grid
                    container
                    justifyContent={"space-between"}
                    sx={{
                        height: "100%"
                    }}
                >

                    <YieldGemBox
                        name={"Sapphire"}
                        gemType={0}
                    />

                    <YieldGemBox
                        name={"Sapphire"}
                        gemType={0}
                    />

                    <YieldGemBox
                        name={"Sapphire"}
                        gemType={0}
                    />

                </Grid>

            </ModalLayout>
        </>
    )
}

export default YieldGems