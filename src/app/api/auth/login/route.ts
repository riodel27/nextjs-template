import prisma from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, password } = (await req.json()) as {
      email: string;
      password: string;
    };

    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({
          status: 'error',
          message: 'Invalid email or password',
        }),
        { status: 401 }
      );
    }

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      return new NextResponse(
        JSON.stringify({
          status: 'error',
          message: 'Invalid email or password',
        }),
        { status: 401 }
      );
    }

    return new NextResponse(
      JSON.stringify({
        user: {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
        },
      }),
      { status: 200 }
    );
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({
        status: 'error',
        message: 'An unexpected error occurred',
      }),
      { status: 500 }
    );
  }
}
