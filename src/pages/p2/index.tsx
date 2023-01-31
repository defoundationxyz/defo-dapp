import {Box, Button, Container, styled, TextField, Tooltip, Typography} from '@mui/material';
import Navbar from 'components/Navbar';
import {BigNumber, Contract, ethers} from 'ethers';
import {NextPage} from 'next/types';
import {BaseSyntheticEvent, useCallback, useEffect, useMemo, useState} from 'react';
import {useDiamondContext} from 'shared/context/DiamondContext/DiamondContextProvider';
import {useSnackbar} from 'shared/context/Snackbar/SnackbarProvider';
import {useWeb3} from '../../shared/context/Web3/Web3Provider';
import {formatDecimalNumber} from '../../shared/utils/format';

const overrideStyles = {
    '& label.Mui-focused': {
        color: 'rgba(255, 255, 255, 0.7)'
    },
    '& .MuiOutlinedInput-root': {
        '&.Mui-focused fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.7)'
        }
    },
    width: 250
}

const Giveaway: NextPage = () => {
    const snackbar = useSnackbar()
    const {diamondContract, config} = useDiamondContext();
    const {account, signer} = useWeb3();
    const [inputError, setInputError] = useState({hasError: false, message: ''});

    const [alreadyPerformed, setAlreadyPerformed] = useState(false);
    const [notStarted, setNotStarted] = useState(false);
    const [rot, setRot] = useState('...');


    useEffect(() => {
        const pollContract = async () => {
            try {
                setNotStarted(parseInt(await diamondContract.getP2CutOverTime, 10) == 0);
                setAlreadyPerformed(parseInt(await diamondContract.getP2Status, 10) == 0);
                setRot(formatDecimalNumber(+ethers.utils.formatEther(await diamondContract.getMyP2RotValue()), 2));
            } catch (error: any) {
                console.log('error on giveaway transfer: ', error);
                snackbar.execute(error?.error?.message || error?.data?.message || error?.reason || 'Please contact DEFO support', 'error')
            }
        }
        pollContract();
    }, [diamondContract]);

    const handlePutToVault = async () => {
        try {
            const tx = await diamondContract.p2PutIntoVault();
            snackbar.execute('Transferring ROT to the vault, please wait.', 'info')
            await tx.wait()
            snackbar.execute('Successfully deposited', 'success')
        } catch (error: any) {
            console.log('error on ROT transfer: ', error);
            snackbar.execute(error?.error?.message || error?.data?.message || error?.reason || 'Please contact DEFO support', 'error')
        }
    }

    const handleClaimDai = async () => {
        try {
            const tx = await diamondContract.p2ClaimDai();
            snackbar.execute('Claiming dai, please wait.', 'info')
            await tx.wait()
            snackbar.execute('Successfully deposited', 'success')
        } catch (error: any) {
            console.log('error on ROT transfer: ', error);
            snackbar.execute(error?.error?.message || error?.data?.message || error?.reason || 'Please contact DEFO support', 'error')
        }
    }

    return (
        <>
            <Navbar/>
            <Container maxWidth={'xs'}>
                <Box textAlign={'center'}>
                    <Typography variant="h4" sx={{color: 'white', mt: 5, mb: 5}}>
                        DEFO ROT for Phase 2
                    </Typography>
                    <Typography variant="h5" sx={{color: 'white', mt: 5, mb: 5}}>
                        <span style={{fontWeight: 700}}>ROT:<br/></span>
                        {rot}
                    </Typography>
                    <Box textAlign="center" mt={3} sx={{display: 'flex', justifyContent: 'space-between'}}>
                        <Tooltip
                            title="Deposit ROT to the Vault">
                            <Button
                                onClick={handlePutToVault}
                                variant="contained"
                                disabled={inputError.hasError || alreadyPerformed || notStarted}
                                size="large"
                                sx={{
                                    color: 'white',
                                    borderColor: 'white',
                                    '&:hover': {
                                        color: 'gray',
                                        borderColor: 'gray',
                                    }
                                }}>Vault</Button>
                        </Tooltip>
                        <Tooltip
                            title="Claim the share of the DAI liquidity pool according to the ROT by all users ROT ratio.">
                            <Button
                                onClick={handleClaimDai}
                                variant="contained"
                                disabled={inputError.hasError || alreadyPerformed || notStarted}
                                size="large"
                                sx={{
                                    color: 'white',
                                    borderColor: 'white',
                                    '&:hover': {
                                        color: 'gray',
                                        borderColor: 'gray',
                                    }
                                }}>DAI</Button>
                        </Tooltip>
                    </Box>
                </Box>
            </Container>
        </>
    )
}

export default Giveaway
