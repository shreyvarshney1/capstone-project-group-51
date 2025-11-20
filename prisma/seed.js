const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const categories = [
    { id: "cat_1", name: "Roads & Potholes" },
    { id: "cat_2", name: "Waste Management" },
    { id: "cat_3", name: "Streetlights" },
    { id: "cat_4", name: "Public Parks" },
    { id: "cat_5", name: "Public Safety" },
    { id: "cat_6", name: "Other" },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {},
      create: category,
    })
  }

  console.log('Categories seeded!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
