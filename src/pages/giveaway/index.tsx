import { Box, Button, Container, Tooltip } from "@mui/material";
import Navbar from "components/Navbar";
import { BigNumber } from "ethers";
import { NextPage } from "next/types";
import { useDiamondContext } from "shared/context/DiamondContext/DiamondContextProvider";
import { useSnackbar } from "shared/context/Snackbar/SnackbarProvider";

const Giveaway: NextPage = () => {
    const snackbar = useSnackbar()
    const { diamondContract } = useDiamondContext()

    const handleGiveawayTransfer = async (defoAmount: BigNumber) => {
        return
        try {
            const tx = await diamondContract.giveaway(defoAmount)
            snackbar.execute("Listing you in the lottery, please wait.", "info")
            await tx.wait()
            snackbar.execute("Successfully listed", "success")
        } catch (error) {
            console.log('error on giveaway transfer: ', error);
            snackbar.execute("Unable to list you for the lottery, please contact DEFO support", "error")
        }
    }

    return (
        <>
            <Navbar />
            <Container>
                <Box minHeight={'60vh'} textAlign='center'>
                    <Tooltip title="Do not use this feature unless you have talked with the DEFO team. This is only meant to be used for the weekly lottery.">
                        <Button
                            onClick={() => handleGiveawayTransfer}
                            variant="contained"
                            color="primary"
                            disabled
                            sx={{
                                color: "white",
                                borderColor: "white",
                                "&:hover": {
                                    color: "gray",
                                    borderColor: "gray",
                                }
                            }}>Giveaway Vault Transfer</Button>
                    </Tooltip>
                </Box>
            </Container>
        </>
    )
}

export default Giveaway
