import { DefaultSession } from "next-auth"
import { Role } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
      wardId?: string
      blockId?: string
      districtId?: string
      stateId?: string
      preferredLanguage?: string
      accessibilityMode?: boolean
      highContrastMode?: boolean
      fontSize?: string
    } & DefaultSession["user"]
  }

  interface User {
    role: Role
    wardId?: string
    blockId?: string
    districtId?: string
    stateId?: string
    preferredLanguage?: string
    accessibilityMode?: boolean
    highContrastMode?: boolean
    fontSize?: string
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser {
    role: Role
    wardId?: string
    blockId?: string
    districtId?: string
    stateId?: string
  }
}

