import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    // DigiLocker/Aadhaar provider placeholder
    CredentialsProvider({
      id: "digilocker",
      name: "DigiLocker",
      credentials: {
        aadhaar: { label: "Aadhaar Number", type: "text" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        // TODO: Integrate with actual DigiLocker API
        // This is a placeholder for Aadhaar/DigiLocker authentication
        if (credentials?.aadhaar && credentials?.otp) {
          // In production, verify OTP with DigiLocker API
          const dbUser = await prisma.user.findFirst({
            where: {
              // In production, verify against hashed Aadhaar
              digilockerLinked: true
            }
          })
          if (!dbUser) return null
          // Convert null values to undefined to match NextAuth User type
          return {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            image: dbUser.image,
            role: dbUser.role,
            wardId: dbUser.wardId ?? undefined,
            blockId: dbUser.blockId ?? undefined,
            districtId: dbUser.districtId ?? undefined,
            stateId: dbUser.stateId ?? undefined,
            preferredLanguage: dbUser.preferredLanguage ?? undefined,
            accessibilityMode: dbUser.accessibilityMode ?? undefined,
            highContrastMode: dbUser.highContrastMode ?? undefined,
            fontSize: dbUser.fontSize ?? undefined,
          }
        }
        return null
      }
    }),
  ],
  session: {
    strategy: "database",
  },
  callbacks: {
    session: async ({ session, user }) => {
      if (session?.user) {
        session.user.id = user.id
        session.user.role = user.role
        session.user.wardId = user.wardId ?? undefined
        session.user.blockId = user.blockId ?? undefined
        session.user.districtId = user.districtId ?? undefined
        session.user.stateId = user.stateId ?? undefined
        session.user.preferredLanguage = user.preferredLanguage ?? undefined
        session.user.accessibilityMode = user.accessibilityMode ?? undefined
        session.user.highContrastMode = user.highContrastMode ?? undefined
        session.user.fontSize = user.fontSize ?? undefined
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
