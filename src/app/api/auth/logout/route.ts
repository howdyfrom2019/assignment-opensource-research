import { tokenStore } from "@/lib/provider/token-store.server";
import { NextResponse } from "next/server";

// -----------------------------------------------------------------------------
// 로그아웃 엔드포인트: refreshToken을 삭제하여 세션을 종료합니다.
// -----------------------------------------------------------------------------
export async function POST(request: Request) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: "refreshToken이 필요합니다." },
        { status: 400 }
      );
    }

    // 토큰 저장소에서 refreshToken 삭제
    const deleted = tokenStore.deleteRefreshToken(refreshToken);

    if (deleted) {
      console.log(`RefreshToken deleted during logout: ${refreshToken}`);
      return NextResponse.json({
        message: "로그아웃 성공",
      });
    } else {
      console.warn(`RefreshToken not found during logout: ${refreshToken}`);
      return NextResponse.json({
        message: "로그아웃 완료 (토큰이 이미 존재하지 않음)",
      });
    }
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "로그아웃 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
