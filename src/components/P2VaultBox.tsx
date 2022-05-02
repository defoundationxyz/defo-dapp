import { HelpOutline } from "@mui/icons-material"
import { Box, Button, Grid, LinearProgress, Paper, Tooltip, Typography, useTheme } from "@mui/material"
import { BigNumber } from "ethers"
import { formatUnits } from "ethers/lib/utils"
import ContentBox from "./ContentBox"
import { useWeb3 } from "./Web3Provider"


const P2VaultBox = ({
    totalStaked,
    yourStake
}: {
    totalStaked: BigNumber,
    yourStake: BigNumber
}) => {
    const theme = useTheme()
    const { status } = useWeb3()

    return (
        <ContentBox
            title="P2 Vault"
            color="#FCBD00"
            button={
                <Tooltip title="Lorem Ipsum">
                    <Button
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
                        <Typography sx={{ margin: theme.spacing(1, 0) }} variant="h4" fontWeight={"600"}>{formatUnits(yourStake, "ether")}</Typography>
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
                        <Typography sx={{ margin: theme.spacing(1, 0) }} variant="h4" fontWeight={"600"}>{formatUnits(totalStaked, "ether")}</Typography>
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
    )
}

export default P2VaultBox