import { useRouter } from 'next/router';
import { Menubar } from 'primereact/menubar';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { PrimeIcons } from 'primereact/api';
import { Dialog } from 'primereact/dialog';
import { InputNumber  } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { SplitButton } from 'primereact/splitbutton';
import { useState, useRef } from 'react';
import swal from 'sweetalert2';
import { useSession, signIn, signOut } from "next-auth/react"
import { useEffect } from 'react';
import { supabase } from '../utils/supbaseclient';

export default function donatePageTemplate() {
    const router = useRouter();
    const { slug } = router.query;

    // Toast ref
    const toast = useRef(null);

    const currentSession = useSession();

    

    const splitButtonOpts = [
        {
            label: 'Go Home',
            icon: 'pi pi-fw pi-home',
            command: () => {
                swal.fire({
                    title: 'Are you sure?',
                    text: 'You will be redirected to the home page.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, go home!'
                }).then((result) => {
                    if (result.value) {
                        router.push('/');
                    }
                });
                return
            },
        },
        {
            label: 'Dashboard',
            icon: 'pi pi-fw pi-cog',
            command: () => {
                router.push('/user/settings');
            }
        },
        {
            label: 'Logout',
            icon: 'pi pi-fw pi-sign-out',
            command: () => {
                swal.fire({
                    title: 'Are you sure?',
                    text: 'You will be logged out and unable to donate without logging in again.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33', 
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Yes, log out!'
                }).then((result) => {
                    if (result.value) {
                        toast.current.show({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'You have been logged out - the window will now refresh.',
                            life: 4000
                        })
                        signOut()
                        setTimeout(() => {
                            window.location.reload();
                        }, 3500);
                    }
                });
                return
            },
        },
    ];

   const handlePayClick = () => {
        if(currentSession.status !== 'authenticated') {
            toast.current.show({
                severity: 'error',
                summary: 'You must be logged in to do that',
                detail: 'Please login with twitch to do that.',
            })
            return
        }

        swal.fire({
            title: 'Confirm Donation',
            html: `Are you sure you want to donate ${donationAmount} usd? All prices are in USD, and donations are <b>non-refundable</b>.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, donate!'
        }).then((result) => {
            if (result.value) {
                return
            }
        })
    }

    const [donationAmount, setDonationAmount] = useState(5);

    const cardHeader = (
        <img
            alt='Card'
            src='https://www.primefaces.org/primereact/images/usercard.png'
        />
    );

    // Make sure the amount is at least 5 usd when it's updated
    useEffect(() => {
        if(donationAmount < 5) {
            // Show the toast
            toast.current.show({
                severity: 'error',
                summary: 'Amount must be at least 5 USD',
                detail: 'Please enter a valid amount.',
                life: 4000
            })
            setDonationAmount(5);
            return
        } 
    }, [donationAmount]);
    
    const cardFooter = (
        <span>
           <InputNumber inputId="currency-us" value={donationAmount} onValueChange={(e) => setDonationAmount(e.value)} mode="currency" currency="USD" locale="en-US" />&nbsp;&nbsp;
           <Button label={`Donate to ${slug}`} icon='pi pi-money-bill' onClick={handlePayClick}/>
        </span>
    );

    return (
        <div>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@sweetalert2/theme-dark@5/dark.css" />
            <Toast ref={toast} />
            <Menubar
                end={
                    currentSession.status === "authenticated" ? (
                        <SplitButton
                            label={`Howdy, ${
                                currentSession.data.user.name
                            }`}
                            model={splitButtonOpts}
                        ></SplitButton>
                    ) : (
                        <Button
                            label='Login with twitch'
                            icon={PrimeIcons.LOCK}
                            onClick={() => {
                                signIn('twitch');
                            }}
                        />
                    )
                }
            />
            <link rel='stylesheet' href='/paymentpage.css'/>
            <br /> <br />
            <div style={{ position: 'absolute', top: '20%', left: '32%' }}>
                <Card
                    header={cardHeader}
                    footer={cardFooter}
                    title={'Donating to ' + slug}
                    style={{ width: '50em', height: '35em' }}
                >
                    {slug} is just another streamer on twitch. You should donate below!
                </Card>
            </div>
        </div>
    );
};