import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const email = 'superadmin@system.com'
  const username = 'superadmin' // Tambahan field username
  const password = 'password123'
  const name = 'Super Admin'

  const role = 'SUPER_ADMIN'
  const agency = 'SYSTEM'

  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    console.log('Super Admin already exists')
    return
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      email,
      username, // Insert field username
      password: hashedPassword,
      name,
      role: role as any,
      agency: agency as any,
    },
  })

  console.log('Super Admin created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })