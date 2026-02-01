import { NextResponse } from "next/server"
import { mockCategories } from "@/lib/data"

export async function GET() {
  try {
    const categories = [...mockCategories].sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json(categories)
  } catch {
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
