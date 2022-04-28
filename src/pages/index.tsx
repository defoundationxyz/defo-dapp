import { Box, Button, Container, Divider, FormControlLabel, Grid, IconButton, LinearProgress, Modal, Paper, Switch, Typography, useTheme } from '@mui/material'
import type { NextPage } from 'next'
import Footer from '../components/Footer'
import { useSnackbar } from "./../components/SnackbarProvider"
import DaiABI from './../abi/DAI.json'
import { CONTRACT_ADDRESSES } from "../constants"
import { BigNumber, Contract } from 'ethers'
import { useWeb3 } from '../components/Web3Provider'
import { ReactChild, ReactNode, useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Head from 'next/head'
import { ArrowUpward, Close, FiberManualRecord, HelpOutline } from '@mui/icons-material'
import { DataGrid, GridColDef } from '@mui/x-data-grid';

const Home: NextPage = () => {

  const theme = useTheme()
  const snackbar = useSnackbar()
  const [daiBalance, setDaiBalance] = useState<BigNumber>()

  const { status, account, signer } = useWeb3()

  const [selectedRows, setSelectedRows] = useState<any[]>()

  const [createYieldGemModalOpen, setCreateYieldGemModalOpen] = useState(false)

  const [claimRewardsModalOpen, setClaimRewardsModalOpen] = useState(false)

  const columns: GridColDef[] = [
    {
      flex: 1,
      field: 'name',
      headerName: 'Name'
    },
    {
      flex: 1,
      field: 'created',
      headerName: 'Created'
    },
    {
      flex: 1,
      field: 'rewards',
      headerName: 'Rewards'
    },
    {
      flex: 0.8,
      field: 'taxTier',
      headerName: 'Tax Tier'
    },
    {
      flex: 1,
      field: 'tierCountdown',
      headerName: 'Tier Countdown'
    },
    {
      flex: 0.8,
      field: 'feesDueIn',
      headerName: 'Fees due in'
    },
    {
      flex: 1.5,
      field: 'payClaim',
      headerName: 'Pay/Claim',
      minWidth: 200,
      renderCell: () => <Box sx={{
      }}>
        <Button
          variant="contained"
          color="primary"
          sx={{
            marginLeft: {
              xs: theme.spacing(0),
              md: theme.spacing(2)
            },
            marginRight: theme.spacing(1),

          }}>PAY FEE</Button>
        <Button
          variant="outlined"
          sx={{
            color: "white",
            borderColor: "white",
            "&:hover": {
              color: "gray",
              borderColor: "gray",
            }
          }}>CLAIM</Button>
      </Box>
    },
  ]

  const [nodes, setNodes] = useState([
    {
      id: 1,
      name: "test1",
      created: 'Feb 26, 2021',
      rewards: '2.4 DEFO',
      taxTier: "10%",
      tierCountdown: "21 days",
      feesDueIn: "10%",
    },
    {
      id: 2,
      name: "test2",
      created: 'Feb 26, 2021',
      rewards: '2.4 DEFO',
      taxTier: "10%",
      tierCountdown: "21 days",
      feesDueIn: "10%",
    },
    {
      id: 3,
      name: "test3",
      created: 'Feb 26, 2021',
      rewards: '2.4 DEFO',
      taxTier: "10%",
      tierCountdown: "21 days",
      feesDueIn: "10%",
    },
    {
      id: 4,
      name: "test4",
      created: 'Feb 26, 2021',
      rewards: '2.4 DEFO',
      taxTier: "10%",
      tierCountdown: "21 days",
      feesDueIn: "10%",
    },
    {
      id: 5,
      name: "test5",
      created: 'Feb 26, 2021',
      rewards: '2.4 DEFO',
      taxTier: "10%",
      tierCountdown: "21 days",
      feesDueIn: "10%",
    },
    {
      id: 6,
      name: "test6",
      created: 'Feb 26, 2021',
      rewards: '2.4 DEFO',
      taxTier: "10%",
      tierCountdown: "21 days",
      feesDueIn: "10%",
    },

  ])



  const updateDaiBalance = async () => {
    try {

      const dai_contract = new Contract(CONTRACT_ADDRESSES.Dai, DaiABI, signer)
      const balance = await dai_contract.balanceOf(account)
      setDaiBalance(balance)

    } catch (error) {
      console.log(error)
      snackbar.execute("error at fetching dai balance", "warning")
    }
  }

  useEffect(() => {

    (async () => {
      if (status === "CONNECTED") {
        updateDaiBalance()
      }
    })()


    return () => {

    }
  }, [status, account, signer])



  const ContentBox = ({ title, children, button, color }: { title: string, children: ReactChild, button?: ReactNode, color: string }) => {
    return (
      <Box
        // component={Container}
        width={"100%"}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          marginTop: {
            xs: theme.spacing(4)
          }
        }}
      >
        <Grid
          container
          justifyContent={"space-between"}
        >
          <Grid item>
            <Typography variant='h5' fontWeight={"500"} sx={{ margin: theme.spacing(0.5, 0) }} >{title}</Typography>
          </Grid>

          {button && <Grid item md="auto">{button}</Grid>}
        </Grid>
        <Box sx={{ position: "relative", marginBottom: theme.spacing(2), marginTop: theme.spacing(1) }} >
          <Divider sx={{ borderWidth: "1.5px" }} />
          <Divider
            sx={{
              backgroundColor: color,
              position: "absolute",
              overflow: "hidden",
              top: "0px",
              height: "2.5px",
              "& span": {
                paddingLeft: 0,
                paddingRight: 0,
              }
            }} >
            <Typography variant='h5' fontWeight={"bold"} >{title}</Typography>
          </Divider>
        </Box>
        {children}
      </Box>
    )
  }

  return (
    <Box>
      <Head>
        <title>DEFO</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Navbar daiBalance={daiBalance} />
      <Container>
        <Typography variant="h4" fontWeight={"bold"}>
          Welcome Philanthropist!
        </Typography>
        <Typography variant='body1' color={"gray"}>
          Ready to make the world a better place for the less fortunate?
        </Typography>

        <Grid
          container
          justifyContent={"space-between"}
          sx={{
            margin: theme.spacing(8, 0),
          }}
        >
          <Grid item xs={12} md={5.8}>
            <ContentBox
              title="Donations"
              color="#FF3B5F"
            >
              <Grid
                container
                justifyContent={"space-between"}
                sx={{
                  height: "100%"
                }}
              >
                <Grid item xs={5.7}>
                  <Paper
                    sx={{
                      padding: {
                        xs: theme.spacing(1),
                        md: theme.spacing(2, 4)
                      },
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center"

                    }}>
                    <Typography variant="body2">YOUR DONATIONS</Typography>
                    <Typography sx={{ margin: theme.spacing(1, 0) }} variant="h4" fontWeight={"600"}>$1,197</Typography>
                    <Box sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center"
                    }}>
                      <Paper sx={{
                        display: "flex",
                        flexDirection: "row",
                        padding: theme.spacing(0.5),
                        marginRight: theme.spacing(1),
                        alignItems: "center",
                        backgroundColor: "rgba(46,190,115, 0.05)",
                        borderRadius: "5px"
                      }}>
                        <ArrowUpward
                          sx={{
                            fontSize: "12px",
                            color: "#2EBE73"
                          }}
                        />
                        <Typography sx={{
                          fontSize: "12px",
                          color: "#2EBE73"
                        }} >34%</Typography>
                      </Paper>
                      <Typography
                        sx={{
                          fontSize: "12px",
                          color: "gray"
                        }}
                      >last 7d</Typography>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={5.7}>
                  <Paper
                    sx={{
                      padding: {
                        xs: theme.spacing(1),
                        md: theme.spacing(2, 4)
                      },
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center"
                    }}>
                    <Typography variant="body2">TOTAL DONATIONS</Typography>
                    <Typography sx={{ margin: theme.spacing(1, 0) }} variant="h4" fontWeight={"600"}>$531,529</Typography>
                    <Box sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center"
                    }}>
                      <Paper sx={{
                        display: "flex",
                        flexDirection: "row",
                        padding: theme.spacing(0.5),
                        marginRight: theme.spacing(1),
                        alignItems: "center",
                        backgroundColor: "rgba(46,190,115, 0.05)",
                        borderRadius: "5px"
                      }}>
                        <ArrowUpward
                          sx={{
                            fontSize: "12px",
                            color: "#2EBE73"
                          }}
                        />
                        <Typography sx={{
                          fontSize: "12px",
                          color: "#2EBE73"
                        }} >24%</Typography>
                      </Paper>
                      <Typography
                        sx={{
                          fontSize: "12px",
                          color: "gray"
                        }}
                      >last 7d</Typography>
                    </Box>
                  </Paper>
                </Grid>

              </Grid>
            </ContentBox>
          </Grid>

          <Grid item xs={12} md={5.8}>
            <ContentBox
              title="Your Yield Gems"
              color="#C6E270"
              button={<Button
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
                    <Typography sx={{ margin: theme.spacing(1, 0) }} variant="h4" fontWeight={"600"}>8</Typography>
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
                    <Typography sx={{ margin: theme.spacing(1, 0) }} variant="h4" fontWeight={"600"}>13</Typography>
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
                    <Typography sx={{ margin: theme.spacing(1, 0) }} variant="h4" fontWeight={"600"}>3</Typography>
                  </Paper>
                </Grid>

              </Grid>
            </ContentBox>
          </Grid>
        </Grid>

        <Grid
          container
          justifyContent={"space-between"}
          sx={{
            // margin: theme.spacing(8, 0)
          }}
        >
          <Grid item xs={12} md={7.9}>
            <ContentBox
              title="P2 Vault"
              color="#FCBD00"
              button={<Button
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
              </Button>}
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
                    <Typography sx={{ margin: theme.spacing(1, 0) }} variant="h4" fontWeight={"600"}>345</Typography>
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
                    <Typography sx={{ margin: theme.spacing(1, 0) }} variant="h4" fontWeight={"600"}>234,565</Typography>
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
          </Grid>

          <Grid item xs={12} md={3.75}>
            <ContentBox
              title="Rewards"
              color="#FCBD00"
              button={<Button
                variant="contained"
                color="info"
              >
                CLAIM
              </Button>}
            >
              <Grid
                container
                justifyContent={"space-between"}
              >
                <Grid item xs={12}>
                  <Paper
                    sx={{
                      padding: {
                        xs: theme.spacing(2),
                        md: theme.spacing(2, 4)
                      },
                    }}>
                    <Typography variant="body2">PENDING REWARDS</Typography>
                    <Typography sx={{ margin: theme.spacing(1, 0) }} variant="h4" fontWeight={"600"}>14 DEFO</Typography>
                    <Typography variant="h5" fontWeight={"bold"}>($90)</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </ContentBox>
          </Grid>

        </Grid>


        <Box
          sx={{
            margin: theme.spacing(8, 0)
          }}
        >

          <Grid container alignItems={"center"}>
            <Grid item xs={12} md="auto" >
              <Typography>{selectedRows?.length || 0} nodes selected</Typography>
            </Grid>
            <Grid item>
              <Button variant="contained" color="primary" sx={{

                marginLeft: {
                  xs: theme.spacing(0),
                  md: theme.spacing(2)
                },
                marginRight: theme.spacing(1),

              }}>PAY FEES</Button>
            </Grid>
            <Grid item>
              <Button onClick={() => setClaimRewardsModalOpen(true)} variant="outlined" sx={{
                color: "white",
                borderColor: "white",
                "&:hover": {
                  color: "gray",
                  borderColor: "gray",
                }
              }}>CLAIM REWARDS</Button>
            </Grid>
          </Grid>


          <Box sx={{
            height: "400px",
            marginTop: theme.spacing(2)
          }}>
            <DataGrid
              rows={nodes}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              checkboxSelection
              hideFooterSelectedRowCount
              onSelectionModelChange={(newSelection: any) => {
                console.log("newSelection", newSelection)
                setSelectedRows(newSelection);
              }}
              disableSelectionOnClick
              rowHeight={59}
              sx={{
                border: "none",
                ".MuiDataGrid-columnHeaders": {
                  border: "none"
                },
                ".MuiDataGrid-virtualScrollerContent": {
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderRadius: "10px"
                },
                "& .Mui-checked": {
                  color: "#2EBE73 !important",
                }
              }}
            />
          </Box>

        </Box>

      </Container >
      <Footer />

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
          minWidth: "50%",
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
                      <Typography variant="body2" >10 DEFO + 50 DAI</Typography>
                    </Box>
                    <Box sx={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      margin: theme.spacing(0.5, 0)

                    }}>
                      <Typography variant="body2" fontWeight={"600"}>Reward:</Typography>
                      <Typography variant="body2" >0.5DEFO/Week</Typography>
                    </Box>
                    <Box sx={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      margin: theme.spacing(0.5, 0)
                    }}>
                      <Typography variant="body2" fontWeight={"600"}>Available:</Typography>
                      <Typography variant="body2" >10/16</Typography>
                    </Box>
                    <Box sx={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      margin: theme.spacing(0.5, 0)
                    }}>
                      <Typography variant="body2" fontWeight={"600"}>Refresh:</Typography>
                      <Typography variant="body2" >2H</Typography>
                    </Box>
                    <Button
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
                      <Typography variant="body2" >40 DEFO + 200 DAI</Typography>
                    </Box>
                    <Box sx={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      margin: theme.spacing(0.5, 0)

                    }}>
                      <Typography variant="body2" fontWeight={"600"}>Reward:</Typography>
                      <Typography variant="body2" >0.5DEFO/Week</Typography>
                    </Box>
                    <Box sx={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      margin: theme.spacing(0.5, 0)
                    }}>
                      <Typography variant="body2" fontWeight={"600"}>Available:</Typography>
                      <Typography variant="body2" >4/5</Typography>
                    </Box>
                    <Box sx={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      margin: theme.spacing(0.5, 0)
                    }}>
                      <Typography variant="body2" fontWeight={"600"}>Refresh:</Typography>
                      <Typography variant="body2" >2H</Typography>
                    </Box>
                    <Button
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
                      <Typography variant="body2" >80 DEFO + 400 DAI</Typography>
                    </Box>
                    <Box sx={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      margin: theme.spacing(0.5, 0)

                    }}>
                      <Typography variant="body2" fontWeight={"600"}>Reward:</Typography>
                      <Typography variant="body2" >0.5DEFO/Week</Typography>
                    </Box>
                    <Box sx={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      margin: theme.spacing(0.5, 0)
                    }}>
                      <Typography variant="body2" fontWeight={"600"}>Available:</Typography>
                      <Typography variant="body2" >1/1</Typography>
                    </Box>
                    <Box sx={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      margin: theme.spacing(0.5, 0)
                    }}>
                      <Typography variant="body2" fontWeight={"600"}>Refresh:</Typography>
                      <Typography variant="body2" >2H</Typography>
                    </Box>
                    <Button
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



      <Modal
        open={claimRewardsModalOpen}
        onClose={() => setClaimRewardsModalOpen(false)}
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh"
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
          width: {
            xs: "90%",
            md: "40%"
          },
          backgroundColor: "#1f1d2b",
          padding: theme.spacing(4),
          position: "relative",
          overflow: "hidden",
          outline: 0,
          border: "solid 1px rgba(255,255,255,0.1)",
          borderRadius: "20px"
        }}>
          <IconButton
            onClick={() => setClaimRewardsModalOpen(false)}
            sx={{
              position: "absolute",
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
          <ContentBox
            title="Claim Rewards"
            color='#03AC90'
          >
            <Grid
              container
              justifyContent={"space-between"}
              alignItems="center"
              sx={{
                // height: "100%"i
                // width: "100%"
              }}
            >
              <Grid item xs={12} md={5.5}>
                <Typography variant='body1'>PENDING REWARDS</Typography>
                <Grid container alignItems="center" >
                  <Grid item>
                    <Typography variant='h4' fontWeight={"500"} sx={{ marginRight: theme.spacing(1) }}>14 DEFO</Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant='h6' fontWeight={"500"}>($90)</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={5.5}>
                <Box sx={{
                }}>
                  <Button
                    variant="contained"
                    color="primary"
                    endIcon={<HelpOutline />}
                    sx={{
                      marginLeft: {
                        xs: theme.spacing(0),
                        md: theme.spacing(2)
                      },
                      marginRight: theme.spacing(1),

                    }}>CLAIM</Button>
                  <Button
                    variant="outlined"
                    endIcon={<HelpOutline />}
                    sx={{
                      color: "white",
                      borderColor: "white",
                      "&:hover": {
                        color: "gray",
                        borderColor: "gray",
                      }
                    }}>VAULT</Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={5} sx={{
                margin: theme.spacing(4, 0),
              }} >
                <Grid container justifyContent={"space-between"}  >
                  <Grid item>
                    <Typography fontWeight={"bold"} variant="body2">CHARITY TAX:</Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="body2">1 DEFO ($25)</Typography>
                  </Grid>
                </Grid>
                <Grid container justifyContent={"space-between"} >
                  <Grid item>
                    <Typography fontWeight={"bold"} variant="body2">CLAIM TAX:</Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="body2">1 DEFO ($25)</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={12}>

                <Box sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: theme.spacing(2)
                }}>
                  <Typography variant="body1" sx={{ marginRight: theme.spacing(1) }}>VAULT STRATEGY</Typography>
                  <HelpOutline sx={{ marginRight: theme.spacing(4) }} />
                  <FormControlLabel control={<Switch defaultChecked color='success' />} label="On" />
                </Box>

                <Grid
                  container
                  justifyContent={"space-between"}
                >
                  <Grid item md={2.8}>
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{
                        color: "white",
                        borderColor: "white",
                        borderRadius: "10px",
                        padding: theme.spacing(1, 2),
                        "&:hover": {
                          color: "gray",
                          borderColor: "gray",
                        }
                      }}>20%</Button>
                  </Grid>

                  <Grid item md={2.8}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color='info'
                      sx={{
                        borderRadius: "10px",
                        padding: theme.spacing(1, 2),
                        borderWidth: "2px",
                        // color: "white",
                        // borderColor: "white",
                        "&:hover": {
                          borderWidth: "2px"
                          //   color: "gray",
                          //   borderColor: "gray",
                        }
                      }}>40%</Button>
                  </Grid>

                  <Grid item md={2.8}>
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{
                        color: "white",
                        borderColor: "white",
                        borderRadius: "10px",
                        padding: theme.spacing(1, 2),
                        "&:hover": {
                          color: "gray",
                          borderColor: "gray",
                        }
                      }}>60%</Button>
                  </Grid>

                  <Grid item md={2.8}>
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{
                        color: "white",
                        borderColor: "white",
                        borderRadius: "10px",
                        padding: theme.spacing(1, 2),
                        "&:hover": {
                          color: "gray",
                          borderColor: "gray",
                        }
                      }}>80%</Button>
                  </Grid>

                </Grid>

              </Grid>

            </Grid>
          </ContentBox>

        </Paper>
      </Modal>





    </Box>


  )
}

export default Home
