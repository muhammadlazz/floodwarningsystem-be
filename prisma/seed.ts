import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const email = 'superadmin@system.com'
  const password = 'password123'
  const name = 'Super Admin'

  // Pastikan string ini sesuai dengan Enum di prisma/schema.prisma
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
