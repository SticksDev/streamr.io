const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
import { getSession } from 'next-auth/react';
const { supabase } = require('../utils/supbaseclient');

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).send('Method not allowed');

    const session = await getSession({ req });
    if (!session) return res.status(401).send('Unauthorized');

    // Query the DB to see if they have a customer ID
    const { data, error } = await supabase
        .from('users')
        .select()
        .eq('twitch_email', session.user.email);

    if (data.length == 0) {
        // Create a new user
        const { data, error } = await supabase
            .from('users')
            .insert([{ twitch_email: session.user.email, isStreamerAccount: false }]);
    }

    // Check if the customer ID is null
    if (data[0].stripe_cust_id == null) {
        // Create a new customer
        const newCusomer = await stripe.customers.create({
            email: session.user.email,
        })

        // Update the customer ID in the DB
        const { data, error } = await supabase
            .from('users')
            .update({ stripe_cust_id: newCusomer.id })
            .eq('twitch_email', session.user.email);

        // Return the customer ID
        res.status(201).json({ customerId: newCusomer.id, paymentMethods: [] });
    }

    // Get linked payment methods
    const stripepayments = await await stripe.paymentMethods.list({
        customer: data[0].stripe_cust_id,
        type: 'card',
    });

    const stripecust = await stripe.customers.retrieve(data[0].stripe_cust_id);

    if(stripepayments.data.length == 0) {
        res.status(200).json({ customerId: data[0].stripe_cust_id, paymentMethods: [] });
        return
    } else {
        // Map the payment methods to a list of objects
        const paymentMethods = stripepayments.data.map(paymentMethod => {
            return {
                cardId: paymentMethod.id,
                cardType: paymentMethod.card.brand,
                lastFour: paymentMethod.card.last4,
                expDate: paymentMethod.card.exp_month + '/' + paymentMethod.card.exp_year,
            }
        })
        // Return the customer ID and the payment methods
        res.status(200).json({ customerId: data[0].stripe_cust_id, paymentMethods: paymentMethods, defaultPaymentMethodId: stripecust.invoice_settings.default_payment_method });
    }
}
