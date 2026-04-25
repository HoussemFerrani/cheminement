import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import bcrypt from "bcryptjs";
import connectToDatabase from "./mongodb";
import clientPromise from "./mongodbClient";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise) as any,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
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

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        if (!user._id) {
          throw new Error("User ID not found");
        }

        const sec = user.accountSecurityVersion ?? 0;
        if (sec >= 1 && (user.role === "client" || user.role === "professional")) {
          if (!user.emailVerified) {
            throw new Error("AUTH_EMAIL_NOT_VERIFIED");
          }
          if (!user.phoneVerifiedAt) {
            throw new Error("AUTH_PHONE_NOT_VERIFIED");
          }
        }

        if (
          user.role === "professional" &&
          user.professionalLicenseStatus === "rejected"
        ) {
          throw new Error("AUTH_LICENSE_REJECTED");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          isAdmin: user.isAdmin || false,
          adminId: user.adminId?.toString(),
          professionalLicenseStatus: user.professionalLicenseStatus,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isAdmin = user.isAdmin;
        token.adminId = user.adminId;
        token.professionalLicenseStatus = user.professionalLicenseStatus;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.adminId = token.adminId as string;
        session.user.professionalLicenseStatus = token.professionalLicenseStatus as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
