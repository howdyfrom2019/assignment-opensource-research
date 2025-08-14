// File: app/api/auth/refresh/route.ts
import { ACCESS_TOKEN_EXPIRY } from "@/lib/config/auth-config";
import { createToken, verifyToken } from "@/lib/utils/auth-util.server";
import { tokenStore } from "@/lib/provider/token-store.server";
import { NextResponse } from "next/server";

// -----------------------------------------------------------------------------
// 토큰 재발급 엔드포인트: refreshToken을 받아 새 accessToken을 발급합니다.
// -----------------------------------------------------------------------------
export async function POST(request: Request) {
  const { refreshToken } = await request.json();

  // 1. refreshToken이 유효한지 검증
  if (
    !refreshToken ||
    !verifyToken(refreshToken) ||
    !tokenStore.hasRefreshToken(refreshToken)
  ) {
    console.error("Invalid or missing refreshToken");
    return NextResponse.json(
      { error: "유효하지 않은 토큰입니다." },
      { status: 401 }
    );
  }

  // 2. 새 accessToken 발급
  const user = { id: "user123", username: "testuser" }; // 실제 DB에서 사용자 정보를 가져오는 로직을 대체
  const newAccessToken = createToken(user, ACCESS_TOKEN_EXPIRY);

  return NextResponse.json({
    message: "토큰 재발급 성공",
    accessToken: newAccessToken,
  });
}
