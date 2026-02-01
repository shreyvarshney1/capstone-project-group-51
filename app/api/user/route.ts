import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const userSettingsSchema = z.object({
  preferredLanguage: z.string().optional(),
  accessibilityMode: z.boolean().optional(),
  highContrastMode: z.boolean().optional(),
  fontSize: z.enum(["SMALL", "MEDIUM", "LARGE", "EXTRA_LARGE"]).optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
})

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        role: true,
        preferredLanguage: true,
        accessibilityMode: true,
        highContrastMode: true,
        fontSize: true,
        digilockerLinked: true,
        createdAt: true,
        ward: {
          select: { name: true }
        },
        block: {
          select: { name: true }
        },
        district: {
          select: { name: true }
        },
        state: {
          select: { name: true }
        },
        _count: {
          select: {
            issues: true,
            votes: true,
            comments: true
          }
        }
      }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    return new NextResponse(null, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const json = await req.json()
    const data = userSettingsSchema.parse(json)

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: {
        id: true,
        name: true,
        preferredLanguage: true,
        accessibilityMode: true,
        highContrastMode: true,
        fontSize: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 })
    }
    return new NextResponse(null, { status: 500 })
  }
}
