import { auth } from '@repo/auth';
import { type Role } from '@repo/database/client';

async function main() {
  console.log('Seeding');

  const pm = await auth.api.signUpEmail({
    body: {
      email: 'pm@example.com',
      name: 'Project Manager',
      password: 'password',
      role: 'PROJECT_MANAGER' as Role,
    },
    asResponse: true,
  });

  const programmer = await auth.api.signUpEmail({
    body: {
      email: 'programmer@example.com',
      name: 'Programmer',
      password: 'password',
      role: 'PROGRAMMER' as Role,
    },
    asResponse: true,
  });

  console.log('PM status:', pm.status);
  console.log('PM body:', await pm.json());

  console.log('Programmer status:', programmer.status);
  console.log('Programmer body:', await programmer.json());
}

main();
