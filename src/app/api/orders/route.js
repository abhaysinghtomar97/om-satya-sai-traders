// src/app/api/orders/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET Orders (Admin sees all, Customer sees their own)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const whereClause = session.user.role === 'ADMIN' ? {} : { userId: session.user.id };

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, phone: true, shopName: true, role: true } },
        items: true,
        timeline: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST: Place a New Order
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Please login to place order' }, { status: 401 });
    }

    const { items, shippingAddress, paymentMethod } = await request.json();
    if (!items || items.length === 0 || !shippingAddress) {
      return NextResponse.json({ error: 'Invalid order details' }, { status: 400 });
    }

    const isVerifiedRetailer =
      session.user.role === 'RETAILER' && session.user.isVerified === true;

    // Fetch exact variant prices & stock from DB to prevent client-side tampering
    const variantIds = items.map((i) => i.variantId);
    const dbVariants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    });

    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      const dbVar = dbVariants.find((v) => v.id === item.variantId);
      if (!dbVar || dbVar.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${dbVar?.product?.name || 'item'}` },
          { status: 400 }
        );
      }

      const appliedPrice = isVerifiedRetailer ? dbVar.retailerPrice : dbVar.farmerPrice;
      totalAmount += appliedPrice * item.quantity;

      orderItemsData.push({
        variantId: dbVar.id,
        productName: dbVar.product.name,
        packSize: dbVar.packSize,
        quantity: item.quantity,
        appliedPrice,
      });
    }

    const orderNumber = `OSST-${Date.now().toString().slice(-6)}`;

    // Execute database transaction: Create Order + Deduct Stock
    const newOrder = await prisma.$transaction(async (tx) => {
      for (const item of orderItemsData) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return tx.order.create({
        data: {
          orderNumber,
          userId: session.user.id,
          shippingAddress,
          totalAmount,
          paymentMethod: paymentMethod || 'COD',
          currentStatus: 'ORDER_PLACED',
          items: { create: orderItemsData },
          timeline: {
            create: {
              status: 'ORDER_PLACED',
              note: 'Order received by Om Satya Sai Traders',
            },
          },
        },
      });
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('Order Creation Error:', error);
    return NextResponse.json({ error: 'Order failed' }, { status: 500 });
  }
}

// PATCH: Admin Updates Pipeline Status & Driver Info
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { orderId, status, note, driverName, driverPhone, vehicleNumber } = await request.json();

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        currentStatus: status,
        ...(driverName && { driverName }),
        ...(driverPhone && { driverPhone }),
        ...(vehicleNumber && { vehicleNumber }),
        timeline: {
          create: {
            status,
            note: note || `Status updated to ${status}`,
          },
        },
      },
      include: { user: true, timeline: true },
    });

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}