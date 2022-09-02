import { Button, Grid, } from "@mui/material"
import { useEffect, useRef, useState } from "react"
import ContentBox from "../ContentBox"
import { useWeb3 } from "shared/context/Web3/Web3Provider"
import ModalLayout from "shared/components/DialogLayout/ModalLayout"
import YieldGemModalBox from "./YieldGemModalBox/YieldGemModalBox"
import YieldGemInfoBox from "./YieldGemInfoBox/YieldGemInfoBox"
import { Gem } from "shared/types/DataTypes"
import { useDiamondContext } from "shared/context/DiamondContext/DiamondContextProvider"
import { useGemsContext } from "shared/context/GemContext/GemContextProvider"
import { ACTIVE_NETOWORKS_COLLECTION } from "shared/utils/constants"
import { useChain } from 'react-moralis'


const YieldGems = () => {
    const gemsModalRef = useRef<any>();
    const { status, isWeb3Enabled } = useWeb3()
    const { chainId } = useChain()

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

    const getMintWindow = async (gemType: number) => {
        const currentMintWindow = await diamondContract.getMintWindow(gemType)
        return {
            mintCount: currentMintWindow.mintCount,
            endOfMintLimitWindow: currentMintWindow.endOfMintLimitWindow
        }
    }

    return (
        <>
            <ContentBox
                title="Your Yield Gems"
                color="#C6E270"
                button={<Button
                    disabled={!(isWeb3Enabled || chainId && ACTIVE_NETOWORKS_COLLECTION.includes(parseInt(chainId, 16)))}
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
                        gemTypeMintWindow={() => getMintWindow(0)}
                        handleCloseModal={handleCloseModal}
                    />

                    <YieldGemModalBox
                        name={"Ruby"}
                        gemType={1}
                        gemTypeMintWindow={() => getMintWindow(1)}
                        handleCloseModal={handleCloseModal}
                        gemConfig={gemsConfig.gem1}
                    />

                    <YieldGemModalBox
                        name={"Diamond"}
                        gemType={2}
                        gemTypeMintWindow={() => getMintWindow(2)}
                        handleCloseModal={handleCloseModal}
                        gemConfig={gemsConfig.gem2}
                    />

                </Grid>

            </ModalLayout>
        </>
    )
}

export default YieldGems