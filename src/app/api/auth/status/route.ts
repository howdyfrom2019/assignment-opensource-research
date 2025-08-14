import { tokenStore } from "@/lib/provider/token-store.server";
import { NextResponse } from "next/server";

// -----------------------------------------------------------------------------
// 토큰 상태 확인 엔드포인트: 현재 저장된 토큰 정보를 반환합니다.
// 실제 서비스에서는 관리자 권한이 필요할 수 있습니다.
// -----------------------------------------------------------------------------
export async function GET() {
  try {
    // 만료된 토큰 정리
    tokenStore.cleanupExpiredTokens();

    const tokenCount = tokenStore.getTokenCount();
    const allTokens = tokenStore.getAllTokens();

    // 토큰 정보를 안전하게 변환 (민감한 정보 제거)
    const tokenInfo = Array.from(allTokens.entries()).map(([token, data]) => ({
      token: token.substring(0, 8) + "...", // 토큰 일부만 표시
      userId: data.userId,
      expiresAt: new Date(data.exp).toISOString(),
      isExpired: data.exp < Date.now(),
    }));

    return NextResponse.json({
      message: "토큰 상태 조회 성공",
      totalTokens: tokenCount,
      tokens: tokenInfo,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Token status error:", error);
    return NextResponse.json(
      { error: "토큰 상태 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
