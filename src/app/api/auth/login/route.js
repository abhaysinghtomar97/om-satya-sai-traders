// src/app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      
      phone,
      password,
      
    } = body;

    const isHi = body.lang === 'hi';

    if (!phone || !password) {
      return NextResponse.json(
        { error: isHi ? 'नाम, मोबाइल नंबर और पासवर्ड आवश्यक हैं।' : 'Name, phone number, and password are required.' },
        { status: 400 }
      );
    }

    // 2. Check agar phone number pehle se registered hai
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });
    

    if (existingUser) {
      return NextResponse.json(
        { error: isHi ? 'यह मोबाइल नंबर पहले से पंजीकृत है।' : 'This mobile number is already registered.' },
        { status: 400 }
      );
    }

    // 3. Password encrypt karein
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);

    // 4. Role ke hisab se verification set karein
    const userRole = role === 'RETAILER' ? 'RETAILER' : 'FARMER';
    const isVerified = userRole === 'FARMER'; // Farmer auto-verified, Retailer admin approve karega

    // 5. User aur default address create karein
    const newUser = await prisma.user.create({
      data: {
        name,
        phone,
        password: hashedPassword,
        role: userRole,
        isVerified,
        shopName: userRole === 'RETAILER' ? shopName : null,
        gstNumber: userRole === 'RETAILER' ? gstNumber : null,
        licenseNumber: userRole === 'RETAILER' ? licenseNumber : null,
        addresses: villageOrCity
          ? {
            create: {
              villageOrCity,
              district: district || '',
              pincode: pincode || '',
              isDefault: true,
            },
          }
          : undefined,
      },
    });

    return NextResponse.json(
      {
        message:
          userRole === 'RETAILER'
            ? 'Registration Successfull! wait for Distributor Approval !'
            : 'Account created! Now you can Login',
        userId: newUser.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { error: 'Server error, Please try again.' },
      { status: 500 }
    );
  }
}