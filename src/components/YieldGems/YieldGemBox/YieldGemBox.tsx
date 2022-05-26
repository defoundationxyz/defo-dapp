import { FiberManualRecord } from "@mui/icons-material";
import { Grid, Paper, Typography, Box, useTheme, Button } from "@mui/material"
import { BigNumber, Contract } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { useEffect, useState } from "react";
import { useWeb3 } from "shared/context/Web3/Web3Provider";
import { CONTRACTS } from "shared/utils/constants";
import { GemTypeMetadata } from "shared/utils/constants";

const YieldGemBox = ({ gemType, name }: {
    gemType: 0 | 1 | 2,
    name: "Sapphire" | "Ruby" | "Diamond"
}) => {
    const theme = useTheme();
    const { signer, status, account } = useWeb3()
    const [gem, setGem] = useState<GemTypeMetadata | null>(null);

    useEffect(() => {
        const loadData = async () => {
            await fetchGemMetadata(gemType);
        }

        loadData();
    }, [gemType])

    const fetchGemMetadata = async (gemType: 0 | 1 | 2) => {
        const contract = new Contract(CONTRACTS.Main.address, CONTRACTS.Main.abi, signer);

        const currentGem = await contract.GetGemTypeMetadata(gemType);
        let currentGemTyped: GemTypeMetadata = {
            LastMint: currentGem[0],
            MaintenanceFee: currentGem[1],
            RewardRate: currentGem[2],
            DailyLimit: currentGem[3],
            MintCount: currentGem[4],
            DefoPrice: currentGem[5],
            StablePrice: currentGem[6],
        };

        setGem(currentGemTyped);
    }

    const getAvailableGemsToBeMinted = () => {
        if (!gem?.DailyLimit) { return 0; }
        return gem?.DailyLimit - gem?.MintCount - 1 // TOOD: fix this in the smart contract
    }

    const createYieldGem = async (gemType: 0 | 1 | 2) => {
        const contract = new Contract(CONTRACTS.Main.address, CONTRACTS.Main.abi, signer);

        // console.log(contract);

        // const gemMetadata = await contract.GetGemTypeMetadata(0);
        // console.log('gemMetadata: ', gemMetadata);
        // return

        // try {
        //     const tx = await contract.MintGem(gemType.toString())
        //     console.log('mint tx: ', tx);
        //     snackbar.execute("Creating, please wait.", "info")
        //     await tx.wait()
        //     await fetchAccountData()
        //     snackbar.execute("Created", "success")
        //     setCreateYieldGemModalOpen(false)
        // } catch (error: any) {
        //     console.log(error)
        //     snackbar.execute(error?.reason || "Error", "error")
        // }
    }

    const formatPrice = (number: BigNumber) => {
        return formatUnits(number, "ether");
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
                        <Typography variant="body2" fontWeight={"bold"} color="#3C88FD">{name}</Typography>
                    </Box>
                    <Box sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        margin: theme.spacing(0.5, 0)
                    }}>
                        <Typography variant="body2" fontWeight={"600"}>Cost:</Typography>
                        <Typography variant="body2">
                            {gem?.DefoPrice && formatPrice(gem?.DefoPrice)} DEFO 
                            + 
                            {gem?.StablePrice && formatPrice(gem?.StablePrice)} DAI
                        </Typography>

                    </Box>
                    <Box sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        margin: theme.spacing(0.5, 0)

                    }}>
                        <Typography variant="body2" fontWeight={"600"}>Reward:</Typography>
                        <Typography variant="body2" >{gem?.RewardRate.toString()}DEFO/Week</Typography>
                    </Box>
                    <Box sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        margin: theme.spacing(0.5, 0)
                    }}>
                        <Typography variant="body2" fontWeight={"600"}>Available:</Typography>
                        <Typography variant="body2">
                            {getAvailableGemsToBeMinted()}/{gem?.DailyLimit.toString()}
                        </Typography>
                    </Box>
                    <Box sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        margin: theme.spacing(0.5, 0)
                    }}>
                        <Typography variant="body2" fontWeight={"600"}>Refresh:</Typography>
                        <Typography variant="body2">2H</Typography>
                        {/* <Typography variant="body2" > {meta && moment.duration(moment(meta[14], "X").diff(moment(gem?.LastMint, "X"))).asHours()}H</Typography> */}
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
        </>
    )
}

export default YieldGemBox