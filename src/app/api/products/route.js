// src/app/api/products/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// 1. GET ALL PRODUCTS (Role-based Pricing ke saath)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    const isVerifiedRetailer =
      session?.user?.role === 'RETAILER' && session?.user?.isVerified === true;

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category'); // e.g., SEEDS, PESTICIDES
    const crop = searchParams.get('crop');         // e.g., Wheat, Paddy

    const whereClause = { isActive: true };
    if (category) whereClause.category = category;
    if (crop) whereClause.crops = { has: crop };

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        variants: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // User ke role ke hisab se price filter/highlight karein
    const formattedProducts = products.map((product) => ({
      ...product,
      variants: product.variants.map((v) => ({
        id: v.id,
        packSize: v.packSize,
        sku: v.sku,
        mrp: v.mrp,
        // Agar verified retailer hai toh wholesale price, warna farmer price
        displayPrice: isVerifiedRetailer ? v.retailerPrice : v.farmerPrice,
        minOrderQty: isVerifiedRetailer ? v.minRetailerQty : 1,
        isWholesale: isVerifiedRetailer,
        stock: v.stock,
      })),
    }));

    return NextResponse.json(formattedProducts, { status: 200 });
  } catch (error) {
    console.error('Fetch Products Error:', error);
    return NextResponse.json({ error: 'Products load nahi ho paye' }, { status: 500 });
  }
}

// 2. ADD NEW PRODUCT (Sirf Admin ke liye)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Sirf Admin product add kar sakta hai' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      category,
      brand,
      description,
      technicalComposition,
      crops, // Array e.g. ["Wheat", "Paddy"]
      images, // Array of URLs
      hsnCode,
      gstRate,
      variants, // Array of { packSize, sku, mrp, farmerPrice, retailerPrice, minRetailerQty, stock }
    } = body;

    // SEO-friendly slug banayein (e.g., "Pioneer 3355" -> "pioneer-3355-1731800")
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

    const newProduct = await prisma.product.create({
      data: {
        name,
        slug,
        category,
        brand,
        description,
        technicalComposition,
        crops: crops || [],
        images: images || [],
        hsnCode,
        gstRate: Number(gstRate) || 0,
        variants: {
          create: variants.map((v) => ({
            packSize: v.packSize,
            sku: v.sku,
            mrp: Number(v.mrp),
            farmerPrice: Number(v.farmerPrice),
            retailerPrice: Number(v.retailerPrice),
            minRetailerQty: Number(v.minRetailerQty) || 1,
            stock: Number(v.stock) || 0,
          })),
        },
      },
      include: { variants: true },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Create Product Error:', error);
    return NextResponse.json({ error: 'Product save karne mein dikkat aayi' }, { status: 500 });
  }
}