import {
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
} from "@/lib/config/auth-config";
import { createToken } from "@/lib/utils/auth-util.server";
import { tokenStore } from "@/lib/provider/token-store.server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const user = { id: "user123", username: "testuser" };
  const accessToken = createToken(user, ACCESS_TOKEN_EXPIRY);
  const refreshToken = createToken({ id: user.id }, REFRESH_TOKEN_EXPIRY);

  // 토큰 저장소에 refreshToken 저장
  tokenStore.setRefreshToken(refreshToken, {
    userId: user.id,
    exp: Date.now() + REFRESH_TOKEN_EXPIRY,
  });

  console.log("New refreshToken saved:", refreshToken);

  return NextResponse.json({
    message: "로그인 성공",
    accessToken,
    refreshToken,
  });
}
