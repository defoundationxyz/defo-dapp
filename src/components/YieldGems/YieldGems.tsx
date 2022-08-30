import { Button, Grid, } from "@mui/material"
import moment from "moment"
import { useEffect, useRef, useState } from "react"
import ContentBox from "../ContentBox"
import { useSnackbar } from "shared/context/Snackbar/SnackbarProvider"
import { useWeb3 } from "shared/context/Web3/Web3Provider"
import { getBalance, getGemTypes } from "shared/utils/format"
import erc20ABI from "abi/ERC20ABI.json";
import ModalLayout from "shared/components/DialogLayout/ModalLayout"
import YieldGemModalBox from "./YieldGemModalBox/YieldGemModalBox"
import YieldGemInfoBox from "./YieldGemInfoBox/YieldGemInfoBox"
import { Gem, GemsConfigState, GemTypeConfig } from "shared/types/DataTypes"
import { useDiamondContext } from "shared/context/DiamondContext/DiamondContextProvider"
import { useGemsContext } from "shared/context/GemContext/GemContextProvider"


const YieldGems = () => {
    const gemsModalRef = useRef<any>();
    const { status } = useWeb3()

    // index representing the GemType
    const [gemsCount, setGemsCount] = useState([0, 0, 0])
	const { diamondContract } = useDiamondContext()

    const { gemsConfig, gemsCollection } = useGemsContext()

    useEffect(() => {
        const currentGemsCount = [0, 0, 0];

        gemsCollection.forEach((gem: Gem) => {
            currentGemsCount[gem.gemTypeId]++;
        })
        setGemsCount(currentGemsCount);
    }, [gemsCollection])


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
                        gemConfig={gemsConfig.gem0}
                        gemTypeMintWindow={async() => { 
                		    const mintWindow0 = await diamondContract.getMintWindow(0)
                            return { 
                                mintCount: mintWindow0.mintCount,
                                endOfMintLimitWindow: mintWindow0.endOfMintLimitWindow
                            }
                        }}
                        handleCloseModal={handleCloseModal}
                    />

                    <YieldGemModalBox
                        name={"Ruby"}
                        gemType={1}
                        gemTypeMintWindow={async() => { 
                		    const mintWindow2 = await diamondContract.getMintWindow(1)
                            return { 
                                mintCount: mintWindow2.mintCount,
                                endOfMintLimitWindow: mintWindow2.endOfMintLimitWindow
                            }
                        }}
                        handleCloseModal={handleCloseModal}
                        gemConfig={gemsConfig.gem1}
                    />

                    <YieldGemModalBox
                        name={"Diamond"}
                        gemType={2}
                        gemTypeMintWindow={async() => { 
                		    const mintWindow2 = await diamondContract.getMintWindow(2)
                            return { 
                                mintCount: mintWindow2.mintCount,
                                endOfMintLimitWindow: mintWindow2.endOfMintLimitWindow
                            }
                        }}
                        handleCloseModal={handleCloseModal}
                        gemConfig={gemsConfig.gem2}
                    />

                </Grid>

            </ModalLayout>
        </>
    )
}

export default YieldGems