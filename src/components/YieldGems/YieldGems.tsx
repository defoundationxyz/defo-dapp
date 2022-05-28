import { Close, FiberManualRecord } from "@mui/icons-material"
import { Box, Button, Grid, IconButton, Modal, Paper, Typography, useTheme } from "@mui/material"
import { Contract, ContractFactory } from "ethers"
import { formatUnits } from "ethers/lib/utils"
import moment from "moment"
import { useEffect, useRef, useState } from "react"
import { CONTRACTS, GemType, GemTypeMetadata } from "shared/utils/constants"
import ContentBox from "../ContentBox"
import { useSnackbar } from "shared/context/Snackbar/SnackbarProvider"
import { useWeb3 } from "shared/context/Web3/Web3Provider"
import { getBalance, getGemTypes } from "shared/utils/format"
import erc20ABI from "abi/ERC20ABI.json";
import ModalLayout from "shared/components/DialogLayout/ModalLayout"
import YieldGemModalBox from "./YieldGemModalBox/YieldGemModalBox"
import { useDiamondContext } from "shared/context/DiamondContext/DiamondContextProvider"
import YieldGemInfoBox from "./YieldGemInfoBox/YieldGemInfoBox"

type yieldGemsMetadataType = {
    gem0: GemTypeMetadata | {},
    gem1: GemTypeMetadata | {},
    gem2: GemTypeMetadata | {},
}

const YieldGems = ({ myGems, fetchAccountData }: { myGems: GemType[], fetchAccountData: Function }) => {
    const gemsModalRef = useRef<any>();
	const { status } = useWeb3()
    const { diamondContract } = useDiamondContext()

    const [yieldGemsMetadata, setYieldGemsMetadata] = useState<yieldGemsMetadataType>({
        gem0: {},
        gem1: {},
        gem2: {},
    });

    // index representing the GemType
    const [gemsCount, setGemsCount] = useState([0, 0, 0])


    useEffect(() => {
        const currentGemsCount = [0, 0, 0];
        myGems.forEach(gem => {
            currentGemsCount[gem.GemType]++;

        })
        setGemsCount(currentGemsCount);
    }, [myGems])

    // useEffect(() => {
    //     const loadGemsData = async () => {
    //         const _gem0Metadata = await diamondContract.GetGemTypeMetadata(0);
    //         const _gem1Metadata = await diamondContract.GetGemTypeMetadata(1);
    //         const _gem2Metadata = await diamondContract.GetGemTypeMetadata(2);

    //         const gem0Metadata = getGemTypes(_gem0Metadata);
    //         const gem1Metadata = getGemTypes(_gem1Metadata);
    //         const gem2Metadata = getGemTypes(_gem2Metadata);

    //         setYieldGemsMetadata({
    //             gem0: gem0Metadata,
    //             gem1: gem1Metadata,
    //             gem2: gem2Metadata
    //         })
    //     }

    //     loadGemsData();
    // }, [])


    const handleOpenModal = () => {
        if (!gemsModalRef.current) { return; }
        gemsModalRef?.current?.handleOpen();
    }

    const handleCloseModal = () => {
        if (!gemsModalRef.current) { return; }
        gemsModalRef?.current?.handleClose();
    }


    return (
        <>
            <ContentBox
                title="Your Yield Gems"
                color="#C6E270"
                button={<Button
                    disabled={status !== "CONNECTED"}
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
                    <YieldGemInfoBox
                        minted={gemsCount[0]}
                        gemType={0}
                        name="Sapphire"
                    />

                    <YieldGemInfoBox
                        minted={gemsCount[1]}
                        gemType={1}
                        name="Ruby"
                    />

                    <YieldGemInfoBox
                        minted={gemsCount[2]}
                        gemType={2}
                        name="Diamond"
                    />
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

                    <YieldGemModalBox
                        name={"Sapphire"}
                        gemType={0}
                        fetchAccountData={fetchAccountData}
                    />

                    <YieldGemModalBox
                        name={"Ruby"}
                        gemType={1}
                        fetchAccountData={fetchAccountData}
                    />

                    <YieldGemModalBox
                        name={"Diamond"}
                        gemType={2}
                        fetchAccountData={fetchAccountData}
                    />

                </Grid>

            </ModalLayout>
        </>
    )
}

export default YieldGems