const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
import { getSession } from 'next-auth/react';
const { supabase } = require('../utils/supbaseclient');

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).send('Method not allowed');

    const session = await getSession({ req });
    if (!session) return res.status(401).send('Unauthorized');

    // Get the user from the DB
    const { data, error } = await supabase
        .from('users')
        .select()
        .eq('twitch_email', session.user.email);

    if(!data || data[0].stripe_cust_id == null) {
        res.status(500).json({ message: 'No customer ID found.' });
        return
    }

    // Create the portal link
    const stripePortalSession = await stripe.billingPortal.sessions.create({
        customer: data[0].stripe_cust_id,
        return_url: 'http://localhost:3000/user/settings',
    });

    // Return the link
    res.status(200).json({ link: stripePortalSession.url });
}