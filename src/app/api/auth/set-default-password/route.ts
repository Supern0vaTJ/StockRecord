import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// One-time API to set default password for users who don't have one
export async function POST() {
  try {
    const defaultHash = await bcrypt.hash("123456", 12);

    const result = await prisma.user.updateMany({
      where: {
        OR: [
          { password: null },
          { password: "" },
        ],
      },
      data: {
        password: defaultHash,
      },
    });

    return NextResponse.json({
      message: `Updated ${result.count} user(s) with default password.`,
      count: result.count,
    });
  } catch (error) {
    console.error("Set default password error:", error);
    return NextResponse.json(
      { error: "Failed to set default passwords." },
      { status: 500 }
    );
  }
}
