import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/app/lib/mongodb";
import User from "@/app/models/User";
import { signToken, authCookieOptions, AUTH_COOKIE } from "@/app/lib/auth";

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    await dbConnect();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockUntil - new Date()) / 60000);
      return NextResponse.json(
        { error: `Account locked due to too many failed attempts. Try again in ${minutesLeft} minute(s).` },
        { status: 403 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= MAX_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_MINUTES * 60000);
        user.failedLoginAttempts = 0;
      }
      await user.save();
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user.isActive === false) {
      return NextResponse.json({ error: "Account is deactivated. Contact your admin." }, { status: 403 });
    }

    if (user.role !== "Admin") {
      return NextResponse.json({ error: "Access denied. Admin accounts only." }, { status: 403 });
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    user.lastLoginAt = new Date();
    await user.save();

    const token = await signToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      mustChangePassword: user.mustChangePassword === true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE,
      value: token,
      ...authCookieOptions(),
    });

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
