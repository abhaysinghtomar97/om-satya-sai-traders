// src/app/api/admin/retailers/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET all Retailers
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const retailers = await prisma.user.findMany({
      where: { role: 'RETAILER' },
      include: { addresses: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(retailers, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load retailers' }, { status: 500 });
  }
}

// PATCH: Approve or Reject Retailer
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { userId, isVerified } = await request.json();

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isVerified },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}