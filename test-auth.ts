import 'dotenv/config'
import { UserService } from './src/services/UserService'

async function testAuth() {
  const userService = new UserService()

  console.log('🧪 Testing User Registration...')
  const registerResult = await userService.register({
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
  })

  console.log('Register Result:', JSON.stringify(registerResult, null, 2))

  if (registerResult.success) {
    console.log('\n🧪 Testing User Login...')
    const loginResult = await userService.login({
      email: 'test@example.com',
      password: 'password123',
    })

    console.log('Login Result:', JSON.stringify(loginResult, null, 2))
  }

  process.exit(0)
}

testAuth().catch(console.error)
