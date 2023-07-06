import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { hash } from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function DELETE(
  _: Request,
  { params }: { params: { email: string } }
) {
  const { email } = params;

  try {
    await prisma.user.deleteMany({
      where: {
        email,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({
        status: 'error',
        message: error.message,
      }),
      { status: 500 }
    );
  }
}

export async function GET(
  _: Request,
  { params }: { params: { email: string } }
) {
  const { email } = params;

  try {
    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    return new NextResponse(
      JSON.stringify({
        user,
      })
    );
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({
        status: 'error',
        message: error.message,
      }),
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { email: string } }
) {
  try {
    const { email: userEmail } = params;

    const { name, email, password, failedLoginAttempts } =
      (await req.json()) as {
        name: string;
        email: string;
        password: string;
        failedLoginAttempts: number;
      };
    const hashed_password = await hash(password, 12);

    const user = await prisma.user.upsert({
      where: {
        email: userEmail,
      },
      update: {
        name,
        email: email.toLowerCase(),
        password: hashed_password,
        failedLoginAttempts,
      },
      create: {
        name,
        email: email.toLowerCase(),
        password: hashed_password,
        failedLoginAttempts,
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
