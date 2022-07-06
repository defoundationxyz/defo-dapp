import { AppBar, Box, Button, Container, Grid, Toolbar, Typography, useTheme } from "@mui/material"
import { useWeb3 } from "shared/context/Web3/Web3Provider"
import Link from "next/link"
import { useChain, useMoralis } from "react-moralis"
import { useEffect } from "react"

const Navbar = () => {
    const theme = useTheme()

    // const { connect, status, account, switchNetwork } = useWeb3()
    const { enableWeb3, isWeb3Enabled, isWeb3EnableLoading, Moralis, account, deactivateWeb3 } = useMoralis();
    const { chainId, chain, switchNetwork, network } = useChain();


    useEffect(() => {
        Moralis.onAccountChanged((account) => {
            console.log('account changed to: ', account);
            if (account == null) {
                window.localStorage.removeItem("connected")
                deactivateWeb3()
                console.log('Null account found');
            }
        })
    }, [])

    const handleConnect = async() => {
       
        await enableWeb3();

        if (typeof window !==  "undefined") { 
            window.localStorage.setItem("connected", "injected");
        } 
        console.log(chainId);
        console.log(chain);
        console.log(network);
    }

    return (
        <AppBar
            position="relative"
            color="transparent"
            elevation={0}
            sx={{
                marginBottom: theme.spacing(4)
            }}>
            <Toolbar
                component={Container}
            >
                <Grid
                    container
                    alignItems={"center"}
                    justifyContent="space-between"
                    sx={{
                        margin: theme.spacing(2, 0),
                    }}>
                    <Grid
                        item
                        xs={3}
                        md={3}
                    >
                        <Box
                            sx={{
                                width: {
                                    xs: "80%",
                                    md: "50%"
                                },
                                display: "flex",
                                alignItems: "center"
                            }}>
                            <a
                                href="https://defoundation.xyz/"
                                target={"_blank"}
                                rel="noreferrer"
                            >
                                <img
                                    src="/logo.png"
                                    style={{
                                        height: "auto",
                                        width: "100%"
                                    }}
                                    alt="logo"
                                />
                            </a>
                        </Box>
                    </Grid>
                    <Grid
                        item
                        container
                        xs={9}
                        md={4}
                        justifyContent="space-between"
                        alignItems={"center"}
                    >
                        <Grid item>
                            <Link
                                href={"https://traderjoexyz.com/trade?outputCurrency=0xd586E7F844cEa2F87f50152665BCbc2C279D8d70#/"}
                            >
                                <a target={"_blank"}>
                                    <Typography fontWeight={"500"}>Buy DAI</Typography>
                                </a>
                            </Link>
                        </Grid>
                        <Grid item>
                            <Link
                                href={"https://traderjoexyz.com/trade?outputCurrency=0xd586E7F844cEa2F87f50152665BCbc2C279D8d70#/"}
                            >
                                <a target={"_blank"}>
                                    <Typography fontWeight={"500"}>Buy DEFO</Typography>
                                </a>
                            </Link>
                        </Grid>
                        <Grid item>
                            <Link
                                href={"https://traderjoexyz.com/trade?outputCurrency=0xd586E7F844cEa2F87f50152665BCbc2C279D8d70#/"}
                            >
                                <a target={"_blank"}>
                                    <Typography fontWeight={"500"}>DEFO Chart</Typography>
                                </a>
                            </Link>
                        </Grid>
                    </Grid>

                    <Grid
                        item
                        xs={12}
                        md={3}
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: {
                                xs: "space-between",
                                md: "flex-end"
                            }
                        }}>
                        {
                            !isWeb3Enabled ?
                                <Button
                                    variant="contained"
                                    onClick={handleConnect}
                                    sx={{
                                        margin: theme.spacing(1),
                                        padding: theme.spacing(2),
                                        width: {
                                            xs: "100%",
                                            md: "auto"
                                        }
                                    }}
                                >
                                    Connect Wallet
                                </Button>
                                : status === "DIFFERENT_CHAIN"
                                    ? <Button
                                        // onClick={async() => { await switchNetwork("0x43114") }}
                                        variant="contained"
                                        sx={{
                                            margin: theme.spacing(1),
                                            padding: theme.spacing(2, 1),
                                            width: {
                                                xs: "100%",
                                                md: "auto"
                                            }
                                        }}
                                    >
                                        Change Network To Avalanche
                                    </Button>
                                    : <Button
                                        disabled
                                        variant="contained"
                                        onClick={() => {
                                            window.location.reload()
                                        }}
                                        sx={{
                                            margin: theme.spacing(1),
                                            padding: theme.spacing(2),
                                            width: {
                                                xs: "100%",
                                                md: "auto"
                                            }
                                        }}
                                    >
                                        {account?.substring(0, 6)}...
                                    </Button>
                        }
                    </Grid>


                    {/* <Grid
                        item
                        xs={12}
                        md={3}
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: {
                                xs: "space-between",
                                md: "flex-end"
                            }
                        }}>
                        {
                            status === "NOT_CONNECTED" ?
                                <Button
                                    variant="contained"
                                    onClick={connect}
                                    sx={{
                                        margin: theme.spacing(1),
                                        padding: theme.spacing(2),
                                        width: {
                                            xs: "100%",
                                            md: "auto"
                                        }
                                    }}
                                >
                                    Connect Wallet
                                </Button>
                                : status === "DIFFERENT_CHAIN"
                                    ? <Button
                                        onClick={switchNetwork}
                                        variant="contained"
                                        sx={{
                                            margin: theme.spacing(1),
                                            padding: theme.spacing(2, 1),
                                            width: {
                                                xs: "100%",
                                                md: "auto"
                                            }
                                        }}
                                    >
                                        Change Network To Avalanche
                                    </Button>
                                    : <Button
                                        disabled
                                        variant="contained"
                                        onClick={() => {
                                            window.location.reload()
                                        }}
                                        sx={{
                                            margin: theme.spacing(1),
                                            padding: theme.spacing(2),
                                            width: {
                                                xs: "100%",
                                                md: "auto"
                                            }
                                        }}
                                    >
                                        {account?.substring(0, 6)}...
                                    </Button>
                        }
                    </Grid> */}
                </Grid>
            </Toolbar>
        </AppBar>
    )
}

export default Navbar

