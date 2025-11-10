import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Status } from '@prisma/client'

const updateStatusSchema = z.object({
  status: z.nativeEnum(Status),
})

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return new NextResponse(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
    })
  }

  const body = await req.json()
  const { status } = updateStatusSchema.parse(body)

  const report = await prisma.report.update({
    where: {
      id: params.id,
    },
    data: {
      status,
    },
  })

  return NextResponse.json(report)
}