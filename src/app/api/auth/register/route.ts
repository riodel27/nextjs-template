import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { hash } from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { name, email, password } = (await req.json()) as {
      name: string;
      email: string;
      password: string;
    };
    const hashed_password = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashed_password,
      },
    });

    return new NextResponse(
      JSON.stringify({
        user: {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
        },
      }),
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (error.code === 'P2002') {
        return new NextResponse(
          JSON.stringify({
            status: 'error',
            message: 'Email address already exists"',
          }),
          { status: 409 }
        );
      }
    }

    return new NextResponse(
      JSON.stringify({
        status: 'error',
        message: error.message,
      }),
      { status: 500 }
    );
  }
}
