import 'dotenv/config'
import { UserService } from './src/services/UserService'
import { Role, Agency } from './src/types'
import { prisma } from './src/config/database'

async function testAuth() {
  const userService = new UserService()

  console.log('🚀 Starting Hierarchy Test...\n')

  // Clean up previous test runs
  console.log('🧹 Cleaning up previous test data...')
  try {
      // Delete Master Admin for BBWS if exists
      const existingMaster = await prisma.user.findFirst({
          where: { role: Role.MASTER_ADMIN, agency: Agency.BBWS }
      })
      if (existingMaster) {
          // Delete all admins created by this master (optional, but good for cleanup)
          await prisma.user.deleteMany({
              where: { agency: Agency.BBWS, role: Role.ADMIN }
          })
          await prisma.user.delete({ where: { id: existingMaster.id } })
          console.log('   - Deleted existing Master Admin BBWS')
      }
  } catch (e) {
      console.log('   - Cleanup warning:', e)
  }
  console.log('✅ Cleanup Complete\n')

  // 1. Login as Super Admin (Seeded)
  console.log('1️⃣  Logging in as Super Admin...')
  const superLogin = await userService.login({
    email: 'superadmin@system.com',
    password: 'password123',
  })

  if (!superLogin.success || !superLogin.token) {
    console.error('❌ Super Admin Login Failed:', superLogin.message)
    process.exit(1)
  }
  console.log('✅ Super Admin Logged In\n')
  const superToken = superLogin.token
  // Mock Requestor for internal service calls (simulating middleware)
  const superUserPayload = { 
    id: superLogin.data!.id, 
    email: superLogin.data!.email, 
    role: superLogin.data!.role, 
    agency: superLogin.data!.agency 
  }

  // 2. Create Master Admin BBWS (by Super Admin)
  console.log('2️⃣  Creating Master Admin BBWS...')
  const masterEmail = `master.bbws.${Date.now()}@test.com`
  const createMaster = await userService.createUser({
    email: masterEmail,
    password: 'password123',
    name: 'Master BBWS',
    role: Role.MASTER_ADMIN,
    agency: Agency.BBWS
  }, superUserPayload)

  if (!createMaster.success) {
    console.error('❌ Create Master Admin Failed:', createMaster.message)
    // If failed (maybe due to race condition or other issue), we can't proceed
    process.exit(1)
  } else {
    console.log('✅ Master Admin BBWS Created')
  }
  console.log('')

  // 3. Login as Master Admin
  if (createMaster.success) {
    console.log('3️⃣  Logging in as Master Admin...')
    const masterLogin = await userService.login({
      email: masterEmail,
      password: 'password123'
    })

    if (masterLogin.success && masterLogin.token) {
       console.log('✅ Master Admin Logged In\n')
       
       const masterUserPayload = {
          id: masterLogin.data!.id,
          email: masterLogin.data!.email,
          role: masterLogin.data!.role,
          agency: masterLogin.data!.agency
       }

       // 4. Create Admin BBWS (by Master Admin)
       console.log('4️⃣  Creating Admin BBWS (by Master Admin)...')
       const adminEmail = `admin.bbws.${Date.now()}@test.com`
       const createAdmin = await userService.createUser({
         email: adminEmail,
         password: 'password123',
         name: 'Admin BBWS',
         role: Role.ADMIN,
         // Agency should be auto-assigned or validated
         agency: Agency.BBWS 
       }, masterUserPayload)

       if (createAdmin.success) {
         console.log('✅ Admin BBWS Created')
       } else {
         console.error('❌ Create Admin BBWS Failed:', createAdmin.message)
       }

       // 5. Try to Create Admin BMKG (Should Fail)
       console.log('\n5️⃣  Trying to Create Admin BMKG (Should Fail)...')
       const failAdmin = await userService.createUser({
          email: `fail.${Date.now()}@test.com`,
          password: 'password123',
          name: 'Wrong Agency Admin',
          role: Role.ADMIN,
          agency: Agency.BMKG // Wrong agency
       }, masterUserPayload)

       if (!failAdmin.success) {
         console.log('✅ Creation blocked as expected:', failAdmin.message)
       } else {
         console.error('❌ Security Breach: Master Admin created user for different agency!')
       }

    }
  }

  console.log('\n🏁 Test Complete')
  process.exit(0)
}

testAuth().catch(console.error)