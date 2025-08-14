import { verifyToken } from "@/lib/utils/auth-util.server";
import { NextResponse } from "next/server";

// -----------------------------------------------------------------------------
// 보호된 데이터 엔드포인트: 유효한 accessToken이 있어야 접근 가능합니다.
// -----------------------------------------------------------------------------
export async function GET(request: Request) {
  const authorization = request.headers.get("Authorization");
  const token = authorization?.split("Bearer ")[1];

  // 1. accessToken이 없거나 유효하지 않은 경우
  if (!token || !verifyToken(token)) {
    console.warn("Unauthorized access attempt: Missing or invalid token");
    return NextResponse.json(
      { error: "유효하지 않은 토큰입니다." },
      { status: 401 }
    );
  }

  // 2. 토큰이 유효하면 데이터 반환
  return NextResponse.json({
    message: "보호된 데이터에 접근 성공",
    data: "안녕하세요, 인증된 사용자님!",
  });
}
