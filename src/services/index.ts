import { User } from '@prisma/client';

export async function registerUser(
  values: Omit<User, 'failedLoginAttempts' | 'id' | 'createdAt' | 'updatedAt'>
) {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(values),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response;
  } catch (error) {
    console.error(error);
    throw new Error('Oops! Something went wrong. Please try again later.');
  }
}
