import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import type { UserRole } from "@/types";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        mobile: { label: "Mobile", type: "text" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.mobile || !credentials?.password || !credentials?.role) {
          throw new Error("Missing credentials");
        }

        const mobile = credentials.mobile as string;
        const password = credentials.password as string;
        const role = credentials.role as UserRole;

        const user = await db.user.findFirst({
          where: {
            mobile,
            role,
            isActive: true,
          },
        });

        if (!user) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          preferredLanguage: user.preferredLanguage,
          profilePhoto: user.profilePhoto,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.mobile = user.mobile;
        token.preferredLanguage = user.preferredLanguage;
        token.profilePhoto = user.profilePhoto;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.mobile = token.mobile as string;
        session.user.preferredLanguage = token.preferredLanguage as string;
        session.user.profilePhoto = token.profilePhoto as string | null;
      }
      return session;
    },
  },
});
