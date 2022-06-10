import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useEffect, useRef, useState } from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Toast } from 'primereact/toast';
import Image from 'next/image';
const swal = require('sweetalert2');
import ScaleLoader from 'react-spinners/ScaleLoader';

export default function userSettings() {
    const currentSession = useSession({
        required: true,
        onUnauthenticated() {
            signIn('twitch');
        },
    });

    let [isLoaderActive, setIsLoaderActive] = useState(true);
    let color = '#ffffff';
    let toast = useRef(null);
    const [paymentMethods, setPaymentMethods] = useState([]);

    // Button Vars
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [defaultCardId, setDefaultCardId] = useState(null);
    const [buttonText, setButtonText] = useState('Please Wait...');
    const [isButtonVisable, setIsButtonVisable] = useState(true);

    const cardTemplate = (rowData) => {
        // rowData.cardType.toLowerCase();
        let cardType = rowData.cardType.toLowerCase();
        switch (cardType) {
            case 'visa':
                return (
                    <span>
                        <Image
                            src='https://github.com/aaronfagan/svg-credit-card-payment-icons/raw/main/flat-rounded/visa.svg'
                            alt='visa'
                            height='50'
                            width='70'
                        />
                    </span>
                );
                break;
            case 'mastercard':
                return (
                    <span>
                        <Image
                            src='https://github.com/aaronfagan/svg-credit-card-payment-icons/raw/main/flat-rounded/mastercard.svg'
                            alt='mastercard'
                            height='50'
                            width='70'
                        />
                    </span>
                );
                break;
            case 'unionpay':
                return (
                    <span>
                        <Image
                            src='https://github.com/aaronfagan/svg-credit-card-payment-icons/raw/main/flat-rounded/unionpay.svg'
                            alt='unionpay'
                            height='50'
                            width='70'
                        />
                    </span>
                );
                break;
            case 'american express':
                return (
                    <span>
                        <Image
                            src='https://github.com/aaronfagan/svg-credit-card-payment-icons/raw/main/flat-rounded/amex.svg'
                            alt='american express'
                            height='50'
                            width='70'
                        />
                    </span>
                );
                break;
            case 'discover':
                return (
                    <span>
                        <Image
                            src='https://github.com/aaronfagan/svg-credit-card-payment-icons/raw/main/flat-rounded/discover.svg'
                            alt='discover'
                            height='50'
                            width='70'
                        />
                    </span>
                );
                break;
            case 'diners club':
                return (
                    <span>
                        <Image
                            src='https://github.com/aaronfagan/svg-credit-card-payment-icons/raw/main/flat-rounded/diners.svg'
                            alt='diners club'
                            height='50'
                            width='70'
                        />
                    </span>
                );
                break;
            case 'jcb':
                return (
                    <span>
                        <Image
                            src='https://github.com/aaronfagan/svg-credit-card-payment-icons/raw/main/flat-rounded/jcb.svg'
                            alt='jcb'
                            height='50'
                            width='70'
                        />
                    </span>
                );
                break;
            default:
                return (
                    <span>
                        <Image
                            src='https://github.com/aaronfagan/svg-credit-card-payment-icons/raw/main/flat-rounded/generic.svg'
                            alt='unknown'
                            height='50'
                            width='70'
                        />
                    </span>
                );
                break;
        }
    };

    const defaultCardTemplate = (rowData) => {
        if (rowData.cardId == defaultCardId) {
            return <span>Yes</span>;
        } else {
            return <span>No</span>;
        }
    };

    useEffect(() => {
        function onDOMContentLoaded() {
            const paymentRequest = fetch('/api/getLinkedPaymentMethods', {
                method: 'GET',
            });

            // Check the status of the request
            paymentRequest.then(async (response) => {
                const rsp = await response.json();
                switch (response.status) {
                    case 201:
                        setIsLoaderActive(false);
                        // Add to the loader div (id: paymentMethods)
                        document.getElementById('paymentInfo').innerHTML =
                            response.text();
                        break;
                    case 200:
                        setIsLoaderActive(false);

                        // Check if the payment methods are empty
                        if (rsp.paymentMethods.length == 0) {
                            document.getElementById('paymentInfo').innerHTML =
                                '<p>You have no linked payment methods. </p>';
                            document.getElementById('paymentInfo').style.color =
                                '#ffffff';
                            setButtonText('Add new payment method');
                            setIsButtonVisable(false);
                            return;
                        }

                        // Take the payment methods and add them to the table
                        setPaymentMethods(rsp.paymentMethods);

                        // Show the table
                        document.getElementById('paymentsTable').style.display =
                            'block';

                        // Set the default card id
                        setDefaultCardId(
                            rsp.defaultPaymentMethodId
                                ? rsp.defaultPaymentMethodId
                                : null,
                        );

                        setButtonText('Manage payment methods');
                        setIsButtonVisable(false);
                        break;
                }
            });
        }

        if (document.readyState === 'complete') {
            onDOMContentLoaded();
        } else {
            window.addEventListener('load', onDOMContentLoaded);
            return () => window.removeEventListener('load', onDOMContentLoaded);
        }
    }, []);

    return (
        <div className='pt-2 font-monoe my-16'>
            <Toast ref={toast} />
            <link rel='stylesheet' href='/paymentpage.css' />
            <div className='container mx-auto'>
                <div className='inputs w-full max-w-2xl p-6 mx-auto'>
                    <h2 className='text-2xl text-white'>Account Settings</h2>
                    <form className='mt-6 border-t border-gray-400 pt-4'>
                        <div className='flex flex-wrap -mx-3 mb-6'>
                            <div className='w-full md:w-full px-3 mb-6'>
                                <label
                                    className='block uppercase tracking-wide text-white text-xs font-bold mb-2'
                                    htmlFor='grid-text-1'
                                >
                                    Linked Payment Methods
                                </label>
                                {/* Create a div to center the loader */}
                                <div className='flex justify-center'>
                                    <ScaleLoader
                                        loading={isLoaderActive}
                                        color={color}
                                    />
                                    <div id='paymentInfo'>
                                        <div
                                            id='paymentsTable'
                                            style={{ display: 'none' }}
                                        >
                                            <DataTable
                                                value={paymentMethods}
                                                responsiveLayout='scroll'
                                            >
                                                <Column
                                                    field='cardType'
                                                    header='Card Type'
                                                    body={cardTemplate}
                                                />
                                                <Column
                                                    field='expDate'
                                                    header='Expiration Date'
                                                />
                                                <Column
                                                    field='lastFour'
                                                    header='Ending In'
                                                />
                                                <Column
                                                    field='isDefault'
                                                    header='Default?'
                                                    body={defaultCardTemplate}
                                                />
                                            </DataTable>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ paddingTop: '20px' }}>
                                    <Button
                                        className='p-button-sm'
                                        label={buttonText}
                                        loading={isButtonLoading}
                                        disabled={isButtonVisable}
                                        onClick={() => {
                                            setIsButtonLoading(true);
                                            setButtonText(
                                                'Processing.. One moment please',
                                            );
                                            fetch('/api/requestStripePortal', {
                                                method: 'GET',
                                            }).then(async (response) => {
                                                const rsp =
                                                    await response.json();
                                                if (response.status !== 200) {
                                                    toast.current.show({
                                                        severity: 'error',
                                                        summary: 'Error',
                                                        detail: rsp.message
                                                            ? rsp.message
                                                            : 'Something went wrong.',
                                                    });
                                                    setIsButtonLoading(false);
                                                    setButtonText(
                                                        paymentMethods.length >
                                                            0
                                                            ? 'Link a new payment method'
                                                            : 'Manage payment methods',
                                                    );
                                                    return;
                                                }

                                                // Confirm they want to add a new payment method
                                                swal.fire({
                                                    title: 'Redirect confirmation',
                                                    text: 'You will be redirected to stripe to manage/add a payment method.',
                                                    icon: 'question',
                                                    showCancelButton: true,
                                                    confirmButtonText:
                                                        'Yes, redirect me',
                                                    cancelButtonText:
                                                        'No, cancel',
                                                }).then((result) => {
                                                    if (result.value) {
                                                        window.location.href =
                                                            rsp.link;
                                                    } else {
                                                        setIsButtonLoading(
                                                            false,
                                                        );
                                                        setButtonText(
                                                            paymentMethods.length ==
                                                                0
                                                                ? 'Link a new payment method'
                                                                : 'Manage payment methods',
                                                        );
                                                    }
                                                });
                                            });
                                        }}
                                    ></Button>
                                </div>
                            </div>
                            <div className='personal w-full border-t border-gray-400 pt-2'>
                                <h2 className='text-2xl text-white'>
                                    Personal info:
                                </h2>
                                <br></br>
                                <div className='w-full md:w-1/2 px-3 mb-6'>
                                    <label className='block uppercase tracking-wide text-white text-xs font-bold mb-2'>
                                        Prefered Donation Nickname
                                    </label>
                                    <InputText></InputText>
                                </div>
                            </div>
                            <div className='flex justify-end'>
                                <Button>Save Changes</Button>{' '}
                                &nbsp;&nbsp;&nbsp;&nbsp;
                                <Button>Go Home</Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
