import { createClerkClient } from '@clerk/backend';
import { config } from 'dotenv';
config()

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function createAdminUser() {
  try {
    const user = await clerk.users.createUser({
      username: 'admin_user',
      password: 'SecureAdmin123!',
      publicMetadata: { role: 'admin' },
    });
    console.log('Admin user created:', user.id);
  } catch (error) {
    console.error('Error creating admin:', error);
  }
}

createAdminUser();