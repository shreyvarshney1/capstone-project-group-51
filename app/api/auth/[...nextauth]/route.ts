import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    // Email/Password credentials provider
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          wardId: user.wardId ?? undefined,
          blockId: user.blockId ?? undefined,
          districtId: user.districtId ?? undefined,
          stateId: user.stateId ?? undefined,
          preferredLanguage: user.preferredLanguage ?? undefined,
          accessibilityMode: user.accessibilityMode ?? undefined,
          highContrastMode: user.highContrastMode ?? undefined,
          fontSize: user.fontSize ?? undefined,
        }
      },
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
    strategy: "jwt",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.wardId = user.wardId
        token.blockId = user.blockId
        token.districtId = user.districtId
        token.stateId = user.stateId
        token.preferredLanguage = user.preferredLanguage
        token.accessibilityMode = user.accessibilityMode
        token.highContrastMode = user.highContrastMode
        token.fontSize = user.fontSize
      }
      return token
    },
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.id as string
        session.user.role = token.role as any
        session.user.wardId = token.wardId as string | undefined
        session.user.blockId = token.blockId as string | undefined
        session.user.districtId = token.districtId as string | undefined
        session.user.stateId = token.stateId as string | undefined
        session.user.preferredLanguage = token.preferredLanguage as string | undefined
        session.user.accessibilityMode = token.accessibilityMode as boolean | undefined
        session.user.highContrastMode = token.highContrastMode as boolean | undefined
        session.user.fontSize = token.fontSize as string | undefined
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
