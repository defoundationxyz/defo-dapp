import {Box, Button, Container, styled, TextField, Tooltip, Typography} from '@mui/material';
import Navbar from 'components/Navbar';
import {BigNumber, Contract, ethers} from 'ethers';
import {NextPage} from 'next/types';
import {BaseSyntheticEvent, Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState} from 'react';
import {useDiamondContext} from 'shared/context/DiamondContext/DiamondContextProvider';
import {useSnackbar} from 'shared/context/Snackbar/SnackbarProvider';
import {useWeb3} from '../../shared/context/Web3/Web3Provider';
import {formatDecimalNumber} from '../../shared/utils/format';
import {BigNumberish} from '@ethersproject/bignumber';
import {ContractFunction} from '@ethersproject/contracts/src.ts';

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


const P2Modal: NextPage = () => {
    const snackbar = useSnackbar()
    const {diamondContract} = useDiamondContext();
    const {account, signer} = useWeb3();
    const [inputError, setInputError] = useState({hasError: false, message: ''});

    const [startedTransitionToP2, setStartedTransitionToP2] = useState(false);
    const [rot, setRot] = useState('');
    const [share, setShare] = useState('');
    const [daiClaimed, setDaiClaimed] = useState('');
    const [defoDeposited, setDefoDeposited] = useState('');
    const [p2Finance, setP2Finance] = useState<{ lpDai: string, totalRot: string }>({lpDai: '', totalRot: ''});
    const [enabledTransitionToP2, setEnabledTransitionToP2] = useState(false);

    useEffect(() => setEnabledTransitionToP2(!!account && startedTransitionToP2 && defoDeposited == '' && daiClaimed == ''),
        [account, startedTransitionToP2, defoDeposited, daiClaimed]);

    const logError = (error: any) => {
        console.error('Error on get p2 data  ', error);
        snackbar.execute(error?.error?.message || error?.data?.message || error?.reason || 'Error. Please contact DEFO support', 'error')
    }
    const formatAmount = (value: BigNumberish) => formatDecimalNumber(+ethers.utils.formatEther(value), 2);

    useEffect(() => {
        try {
            diamondContract.getP2CutOverTime().then((value: BigNumber) => setStartedTransitionToP2(!!value));
            diamondContract.getMyP2RotValue().then((value: BigNumber) => setRot(formatAmount(value)));
            diamondContract.getMyP2DaiValue().then((value: BigNumber) => setShare(formatAmount(value)));
            diamondContract.getMyP2DaiReceived().then((value: BigNumber) => setDaiClaimed(formatAmount(value)));
            diamondContract.getMyP2DepositedToVault().then((value: BigNumber) => setDefoDeposited(formatAmount(value)));
            diamondContract.getP2Finance().then((value: [BigNumber, BigNumber]) => setP2Finance({
                lpDai: formatAmount(value[0]),
                totalRot: formatAmount(value[1])
            }));
        } catch (error: any) {
            logError(error);
        }
    }, [diamondContract, account]);

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
                        <span style={{fontWeight: 700}}>ROT:</span>
                        {' '}{rot}
                    </Typography>
                    <Typography variant="h5" sx={{color: 'white', mt: 5, mb: 5}}>
                        <span style={{fontWeight: 700}}>Total DAI Liquidity:</span>
                        {' '}{rot}
                    </Typography>
                    <Typography variant="h5" sx={{color: 'white', mt: 5, mb: 5}}>
                        <span style={{fontWeight: 700}}>Your share:</span>
                        {' '}{rot}%, which is {rot} Dai
                    </Typography>
                    <Box textAlign="center" mt={3} sx={{display: 'flex', justifyContent: 'space-between'}}>
                        <Tooltip
                            title="Deposit ROT to the Vault">
                            <Button
                                onClick={handlePutToVault}
                                variant="contained"
                                disabled={!enabledTransitionToP2}
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
                                disabled={!enabledTransitionToP2}
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

export default P2Modal
