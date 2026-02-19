import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

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

const pool = new pg.Pool({
  connectionString,
  ...(sslRequired ? { ssl: { rejectUnauthorized: false } } : {}),
})
const adapter = new PrismaPg(pool)

export const prisma = new PrismaClient({ adapter }) // v7 now requires the adapter here
