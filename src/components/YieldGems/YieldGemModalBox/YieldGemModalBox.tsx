import { FiberManualRecord } from "@mui/icons-material";
import { Grid, Paper, Typography, Box, useTheme, Button } from "@mui/material"
import { BigNumber, Contract, ethers } from "ethers";
import { useEffect, useState } from "react";
import { useDiamondContext } from "shared/context/DiamondContext/DiamondContextProvider";
import { useGemsContext } from "shared/context/GemContext/GemContextProvider";
import { useSnackbar } from "shared/context/Snackbar/SnackbarProvider";
import { useWeb3 } from "shared/context/Web3/Web3Provider";
import { GemTypeConfig, GemTypeMintWindow } from "shared/types/DataTypes";
import { CONTRACTS } from "shared/utils/constants";
import { primaryColorMapper, secondaryColorMapper } from "../utils/colorMapper";

const YieldGemModalBox = ({ gemType, name, gemConfig, gemTypeMintWindow, handleCloseModal }: {
    gemType: 0 | 1 | 2,
    name: "Sapphire" | "Ruby" | "Diamond",
    gemConfig: GemTypeConfig,
    gemTypeMintWindow: () => Promise<GemTypeMintWindow>
    handleCloseModal: () => void
}) => {
    const theme = useTheme();
    const { diamondContract } = useDiamondContext()
    const snackbar = useSnackbar();

    const { signer, account } = useWeb3();
    const { updateGemsCollection } = useGemsContext()

    const [gemMintWindow, setGemMintWindow] = useState<GemTypeMintWindow>({
        mintCount: BigNumber.from(0),
        endOfMintLimitWindow: 0
    })


    useEffect(() => {
        const loadData = async () => {
            const currentGemMintWindow = await gemTypeMintWindow()
            setGemMintWindow(currentGemMintWindow)
        }
        loadData()
    }, [])

    // TODO: check if allowance is less that required sum => trigger approve
    const createYieldGem = async (gemType: 0 | 1 | 2) => {
        try {
            const defo = new Contract(CONTRACTS.DefoToken.address, CONTRACTS.DefoToken.abi, signer)
            const defoAllowance = await defo.allowance(account, CONTRACTS.Main.address)
            const dai = new Contract(CONTRACTS.Dai.mainnetAddress, CONTRACTS.Dai.abi, signer)
            const daiAllowance = await dai.allowance(account, CONTRACTS.Main.address)

            if (defoAllowance.isZero()) {
                const tx = await defo.approve(CONTRACTS.Main.address, ethers.constants.MaxUint256)
                await tx.wait()
            }

            if (daiAllowance.isZero()) {
                const tx = await dai.approve(CONTRACTS.Main.address, ethers.constants.MaxUint256)
                await tx.wait()
            }

                const tx = await diamondContract.mint(gemType.toString())
                snackbar.execute("Creating, please wait.", "info")
                await tx.wait()
                
                await updateGemsCollection()
                snackbar.execute("Created", "success")
                handleCloseModal()
        } catch (error: any) {
            console.log(error)
            snackbar.execute(error?.reason || error?.message || "Error", "error")
        }
    }

    return (
        <>
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
                        border: `solid 1px ${primaryColorMapper[gemType]}`
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
                            color: primaryColorMapper[gemType]
                        }} />
                        <Typography variant="body2" fontWeight={"bold"} color={primaryColorMapper[gemType]}>{name}</Typography>
                    </Box>
                    <Box sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        margin: theme.spacing(0.5, 0)
                    }}>
                        <Typography variant="body2" fontWeight={"600"}>Cost:</Typography>
                        <Typography variant="body2">
                            {ethers.utils.formatEther(gemConfig.price[1])} DEFO
                            +
                            {ethers.utils.formatEther(gemConfig.price[0])} DAI
                        </Typography>

                    </Box>
                    <Box sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        margin: theme.spacing(0.5, 0)

                    }}>
                        <Typography variant="body2" fontWeight={"600"}>Reward:</Typography>
                        <Typography variant="body2" >{ethers.utils.formatEther(gemConfig.rewardAmountDefo)} DEFO/Week</Typography>
                    </Box>
                    <Box sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        margin: theme.spacing(0.5, 0)
                    }}>
                        <Typography variant="body2" fontWeight={"600"}>Available:</Typography>
                        <Typography variant="body2">

                            {+gemConfig.maxMintsPerLimitWindow - +(gemMintWindow.mintCount.toString())} / {gemConfig.maxMintsPerLimitWindow}
                        </Typography>
                    </Box>
                    <Box sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        margin: theme.spacing(0.5, 0)
                    }}>
                        <Typography variant="body2" fontWeight={"600"}>Refresh:</Typography>
                        <Typography variant="body2">{'TO FIX'} hours</Typography>
                    </Box>
                    <Button
                        onClick={() => createYieldGem(gemType)}
                        variant='contained'
                        disabled={!gemConfig.isMintAvailable}
                        sx={{
                            color: "white",
                            backgroundColor: primaryColorMapper[gemType],
                            marginTop: theme.spacing(1),
                            "&:hover": {
                                backgroundColor: secondaryColorMapper[gemType],
                            }
                        }}
                    >CREATE</Button>
                </Paper>
            </Grid>
        </>
    )
}

export default YieldGemModalBox