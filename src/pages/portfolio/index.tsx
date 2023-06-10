import {
    Box,
    CircularProgress,
    Container,
    Grid,
    Typography
} from '@mui/material';
import {NextPage} from 'next/types';
import {useEffect, useState} from 'react';
import SimpleFooter from '../../components/SimpleFooter';

const P2Modal: NextPage = () => {
    const [vaultWorth, setVaultWorth] = useState<number | null>(null);
    const formatAmount = (value: number) => `$${Intl.NumberFormat().format(Math.round(value))}`;

    useEffect(() => {
        fetch('https://api.debank.com/asset/net_curve_24h?user_addr=0xf99d8717c3c2bb5a4959fab7f152eddee56580e2', {
            method: 'GET'
        }).then((res) => {
            res.json().then(
                (datamain) => {
                    console.log(datamain)
                    const url2 = 'https://thornode.ninerealms.com/bank/balances/thor1pjy3skfpynxwane8m3gp203ud46vwyc98qeq4q';
                    fetch(url2, {
                        'headers': {
                            'accept': 'application/json, text/plain, */*',
                            'accept-language': 'en-US,en;q=0.9',
                            'sec-ch-ua': '"Chromium";v="110", "Not A(Brand";v="24", "Google Chrome";v="110"',
                            'sec-ch-ua-mobile': '?1',
                            'sec-ch-ua-platform': '"Android"',
                            'sec-fetch-dest': 'empty',
                            'sec-fetch-mode': 'cors',
                            'sec-fetch-site': 'cross-site'
                        },
                        'referrer': 'https://thorchain.net/',
                        'referrerPolicy': 'strict-origin-when-cross-origin',
                        'body': null,
                        'method': 'GET',
                        'mode': 'cors',
                        'credentials': 'omit'
                    }).then((res) => res.json().then((data) => {

                        const runAmount = data.result[0].amount / 100000000
                        console.log('THOR', data.result[0].amount)
                        fetch('https://midgard.ninerealms.com/v2/stats', {
                            method: 'GET'
                        }).then((res) => res.json().then((info) => {
                            let thorPrice = Number(info.runePriceUSD);
                            let thorWorth = (runAmount * thorPrice);
                            setVaultWorth(1500 + thorWorth + datamain.data.usd_value_list[(datamain.data.usd_value_list.length - 1)][1]);
                        }))

                    }));
                })
        });
    }, []);

    return (
        <Box height={'100%'}>
            <Container>
                <Box textAlign={'center'} minWidth={'500px'}>
                    <img src="/logo_updated.png" alt="logo" width="150" height="150"/>
                    <Typography variant="h2" sx={{fontWeight: 500, color: 'white'}}>
                        DEFO
                    </Typography>
                    <Grid container textAlign="center" width={'100%'} spacing={0}
                          sx={{color: 'white', mt: 5, mb: 5}}>
                        <Grid item xs={6}>
                            <Typography variant="h4"
                                        sx={{textAlign: 'right', marginRight: '30px', marginBottom: '30px'}}>Vault
                                Worth:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="h4"
                                        sx={{textAlign: 'left'}}>{vaultWorth != null ? formatAmount(vaultWorth) :
                                <CircularProgress size={30}/>}</Typography>
                        </Grid>


                        <Grid item xs={6}>
                            <Typography
                                sx={{
                                    fontWeight: 600,
                                    textAlign: 'right',
                                    marginRight: '30px'
                                }}>Emerald:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography
                                sx={{textAlign: 'left'}}>{vaultWorth != null ? formatAmount(vaultWorth * 0.0135) :
                                <CircularProgress size={10}/>}</Typography>
                        </Grid>

                        <Grid item xs={6}>
                            <Typography
                                sx={{
                                    fontWeight: 600,
                                    textAlign: 'right',
                                    marginRight: '30px'
                                }}>Diamond:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography
                                sx={{textAlign: 'left'}}>{vaultWorth != null ? formatAmount(vaultWorth * 0.0045) :
                                <CircularProgress size={10}/>}</Typography>
                        </Grid>


                        <Grid item xs={6}>
                            <Typography
                                sx={{fontWeight: 600, textAlign: 'right', marginRight: '30px'}}>Ruby:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography
                                sx={{textAlign: 'left'}}>{vaultWorth != null ? formatAmount(vaultWorth * 0.0015) :
                                <CircularProgress size={10}/>}</Typography>
                        </Grid>


                        <Grid item xs={6}>
                            <Typography
                                sx={{
                                    fontWeight: 600,
                                    textAlign: 'right',
                                    marginRight: '30px'
                                }}>Sapphire:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography
                                sx={{textAlign: 'left'}}>{vaultWorth != null ? formatAmount(vaultWorth * 0.0005) :
                                <CircularProgress size={10}/>}</Typography>
                        </Grid>

                    </Grid>
                </Box>
            </Container>
            <SimpleFooter/>
        </Box>
    )
}

export default P2Modal
