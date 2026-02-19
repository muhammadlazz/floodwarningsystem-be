import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcrypt'
import * as dotenv from 'dotenv'

dotenv.config()

const rawConnectionString = process.env.DATABASE_URL!
const url = new URL(rawConnectionString)
const sslmode = url.searchParams.get('sslmode')

if (
  (sslmode === 'prefer' || sslmode === 'require' || sslmode === 'verify-ca') &&
  !url.searchParams.has('uselibpqcompat')
) {
  url.searchParams.set('uselibpqcompat', 'true')
}

const connectionString = url.toString()
const sslRequired = sslmode === 'require'

const pool = new Pool({
  connectionString,
  ...(sslRequired ? { ssl: { rejectUnauthorized: false } } : {}),
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const email = 'superadmin@system.com'
  const password = 'password123'
  const name = 'Super Admin'
  
  // Using explicit strings that match the Enums
  const role = 'SUPER_ADMIN'
  const agency = 'SYSTEM'

  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash(password, 10)
    // @ts-ignore: Ignoring type check as client might not be generated
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role as any, 
        agency: agency as any
      }
    })
    console.log('Super Admin created successfully')
  } else {
    console.log('Super Admin already exists')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
