import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "./db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }
        await connectToDatabase();
        
        const user = await User.findOne({ email: credentials.email });
        
        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }
        
        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );
        
        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }
        
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          logisticId: user.logisticId ? user.logisticId.toString() : '',
          branch: user.branch ? user.branch.toString() : '',
          bookingBranch: user.bookingBranch ? user.bookingBranch.toString() : '',
          ewbApiAccess: user.ewbApiAccess || false,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.logisticId = (user as any).logisticId;
        token.branch = (user as any).branch;
        token.bookingBranch = (user as any).bookingBranch;
        token.ewbApiAccess = (user as any).ewbApiAccess;
      } else if (token.id) {
        // Fetch fresh branch/bookingBranch details from the database on refresh
        try {
          await connectToDatabase();
          const dbUser = await User.findById(token.id).select('logisticId branch bookingBranch role ewbApiAccess');
          if (dbUser) {
            token.logisticId = dbUser.logisticId ? dbUser.logisticId.toString() : '';
            token.branch = dbUser.branch ? dbUser.branch.toString() : '';
            token.bookingBranch = dbUser.bookingBranch ? dbUser.bookingBranch.toString() : '';
            token.role = dbUser.role;
            token.ewbApiAccess = dbUser.ewbApiAccess || false;
          }
        } catch (err) {
          console.error("Error updating token in jwt callback:", err);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).logisticId = token.logisticId;
        (session.user as any).branch = token.branch;
        (session.user as any).bookingBranch = token.bookingBranch;
        (session.user as any).ewbApiAccess = token.ewbApiAccess;
      }
      return session;
    }
  },
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "default_secret_for_development_only",
};
