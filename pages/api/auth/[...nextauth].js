import NextAuth from "next-auth"
import TwitchProvider from "next-auth/providers/twitch";
export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    TwitchProvider({
        clientId: process.env.TWITCH_CLIENT_ID || '10oa2u9hrnsbel1n43fz2yx8pfayq8',
        clientSecret: process.env.TWITCH_CLIENT_SECRET || 'f3zyc72kkapd55pj9h5ehgom9k3fz3'
    })
  ],
})