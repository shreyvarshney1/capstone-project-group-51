import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Category } from '@prisma/client'

const formSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  category: z.nativeEnum(Category),
  latitude: z.number(),
  longitude: z.number(),
  imageUrl: z.string().url(),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
    })
  }

  const body = await req.json()
  const { title, description, category, latitude, longitude, imageUrl } =
    formSchema.parse(body)

  const report = await prisma.report.create({
    data: {
      title,
      description,
      category,
      latitude,
      longitude,
      imageUrl,
      userId: session.user.id,
    },
  })

  return NextResponse.json(report)
}