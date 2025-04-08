// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar.readonly",
          access_type: "offline", // Ensure refresh tokens are issued
          prompt: "consent", // Force re-consent to get a refresh token
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token; // Save the refresh token
        token.expiresAt = Date.now() + account.expires_in * 1000; // Save the expiration time
      }

      // Refresh the access token if it has expired
      if (Date.now() > token.expiresAt) {
        try {
          const url = "https://oauth2.googleapis.com/token";
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
              client_secret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
              refresh_token: token.refreshToken,
              grant_type: "refresh_token",
            }),
          });

          const refreshedTokens = await response.json();

          if (!response.ok) throw refreshedTokens;

          token.accessToken = refreshedTokens.access_token;
          token.expiresAt = Date.now() + refreshedTokens.expires_in * 1000;
        } catch (error) {
          console.error("Error refreshing access token:", error);
          return null;
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
};

export default NextAuth(authOptions);
