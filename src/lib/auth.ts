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
        
        const user = await User.findOne({ email: credentials.email }).lean();
        
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

        // Check if user or company is deactivated
        if (user.role !== 'superadmin') {
          if (user.role === 'logistic' && user.isActive === false) {
            throw new Error("Your company account has been deactivated. Please contact support.");
          }
          
          if (user.role !== 'logistic' && user.logisticId) {
            const parentLogistic = await User.findById(user.logisticId).select('isActive').lean() as any;
            if (parentLogistic && parentLogistic.isActive === false) {
              throw new Error("Your company account has been deactivated. Please contact support.");
            }
          }
          
          if (user.isActive === false) {
            throw new Error("Your account has been deactivated. Please contact support.");
          }
        }
        
        let hasEwbAccess = user.ewbApiAccess || false;
        let logisticName = user.role === 'logistic' ? user.name : '';
        
        if (user.role === 'branch' && user.logisticId) {
          const parentLogistic = await User.findById(user.logisticId).select('ewbApiAccess name').lean();
          if (parentLogistic) {
            hasEwbAccess = !!parentLogistic.ewbApiAccess;
            logisticName = parentLogistic.name;
          }
        }
        
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          logisticId: user.logisticId ? user.logisticId.toString() : '',
          branch: user.branch ? user.branch.toString() : '',
          bookingBranch: user.bookingBranch ? user.bookingBranch.toString() : '',
          ewbApiAccess: hasEwbAccess,
          logisticName,
          permissions: user.permissions || {},
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
        token.logisticName = (user as any).logisticName;
        token.permissions = (user as any).permissions;
      } else if (token.id) {
        // Fetch fresh details from the database on refresh
        try {
          await connectToDatabase();
          const dbUser = await User.findById(token.id).select('logisticId branch bookingBranch role ewbApiAccess permissions isActive');
          if (dbUser) {
            // Force logout if user is deactivated
            if (dbUser.isActive === false) {
              return {}; // Returns empty token, causing logout
            }

            // Force logout if parent logistic company is deactivated
            if (dbUser.role !== 'superadmin' && dbUser.role !== 'logistic' && dbUser.logisticId) {
              const parentLogistic = await User.findById(dbUser.logisticId).select('isActive').lean() as any;
              if (parentLogistic && parentLogistic.isActive === false) {
                return {}; // Cause logout
              }
            }

            token.logisticId = dbUser.logisticId ? dbUser.logisticId.toString() : '';
            token.branch = dbUser.branch ? dbUser.branch.toString() : '';
            token.bookingBranch = dbUser.bookingBranch ? dbUser.bookingBranch.toString() : '';
            token.role = dbUser.role;
            
            let hasEwbAccess = dbUser.ewbApiAccess || false;
            let logisticName = dbUser.role === 'logistic' ? dbUser.name : '';
            if (dbUser.role === 'branch' && dbUser.logisticId) {
              const parentLogistic = await User.findById(dbUser.logisticId).select('ewbApiAccess name').lean();
              if (parentLogistic) {
                hasEwbAccess = !!parentLogistic.ewbApiAccess;
                logisticName = parentLogistic.name;
              }
            }
            token.ewbApiAccess = hasEwbAccess;
            token.logisticName = logisticName;
            token.permissions = dbUser.permissions || {};
          } else {
            return {}; // User deleted
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
        (session.user as any).logisticName = token.logisticName;
        (session.user as any).permissions = token.permissions;
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
