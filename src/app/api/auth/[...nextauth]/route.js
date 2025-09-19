

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { connectDB } from "@/lib/connectDB";
import bcrypt from "bcryptjs";

export const authOptions = {
  secret: process.env.NEXT_PUBLIC_AUTH_SECRET,
  session: {
    strategy: "jwt", // fixed typo: stategy -> strategy
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials;

        if (!email || !password) return null;

        const db = await connectDB();
        const currentUser = await db
          .collection("registered_users")
          .findOne({ email });

        if (!currentUser) return null;

        // Compare hashed password (recommended)
        const isValid = await bcrypt.compare(password, currentUser.password);
        if (!isValid) return null;

        // Return minimal user object
        return {
          id: currentUser._id.toString(),
          name: currentUser.name || "No Name",
          email: currentUser.email,
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
    }),

    GithubProvider({
      clientId: process.env.NEXT_PUBLIC_GITHUB_ID,
      clientSecret: process.env.NEXT_PUBLIC_GITHUB_SECRET,
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      return session;
    },
  },

  pages: {
    signIn: "/login", // redirect to your login page
  },
};

// Export async handler for Next.js 14 app router
const handler = async (req, res) => await NextAuth(req, res, authOptions);

export { handler as GET, handler as POST };
