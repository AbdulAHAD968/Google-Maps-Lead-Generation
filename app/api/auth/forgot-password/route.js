import { NextResponse } from "next/server";
import crypto from "crypto";
import { dbConnect } from "@/app/lib/mongodb";
import User from "@/app/models/User";
import { sendMail } from "@/app/lib/mailer";
import { passwordResetEmail } from "@/app/lib/emailTemplates";

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return NextResponse.json({ success: true });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000;
    await user.save();

    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

    await sendMail({
      to: user.email,
      subject: "Reset your Lead Generation password",
      html: passwordResetEmail({ resetUrl }),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
