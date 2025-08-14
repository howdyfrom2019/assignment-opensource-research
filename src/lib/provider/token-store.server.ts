/**
 * 토큰 저장소를 싱글톤으로 관리하는 클래스
 * 실제 서비스에서는 Redis나 DB를 사용해야 합니다.
 */
export interface RefreshTokenData {
  userId: string;
  exp: number;
}

class TokenStore {
  private static instance: TokenStore;
  private refreshTokens: Map<string, RefreshTokenData>;

  private constructor() {
    this.refreshTokens = new Map<string, RefreshTokenData>();
  }

  public static getInstance(): TokenStore {
    if (!TokenStore.instance) {
      TokenStore.instance = new TokenStore();
    }
    return TokenStore.instance;
  }

  /**
   * refreshToken 저장
   */
  public setRefreshToken(token: string, data: RefreshTokenData): void {
    this.refreshTokens.set(token, data);
    console.log(`New refreshToken saved: ${token}`);
  }

  /**
   * refreshToken 조회
   */
  public getRefreshToken(token: string): RefreshTokenData | undefined {
    return this.refreshTokens.get(token);
  }

  /**
   * refreshToken 존재 여부 확인
   */
  public hasRefreshToken(token: string): boolean {
    return this.refreshTokens.has(token);
  }

  /**
   * refreshToken 삭제
   */
  public deleteRefreshToken(token: string): boolean {
    return this.refreshTokens.delete(token);
  }

  /**
   * 만료된 토큰 정리
   */
  public cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [token, data] of this.refreshTokens.entries()) {
      if (data.exp < now) {
        this.refreshTokens.delete(token);
        console.log(`Expired refreshToken removed: ${token}`);
      }
    }
  }

  /**
   * 모든 토큰 조회 (디버깅용)
   */
  public getAllTokens(): Map<string, RefreshTokenData> {
    return new Map(this.refreshTokens);
  }

  /**
   * 저장된 토큰 개수
   */
  public getTokenCount(): number {
    return this.refreshTokens.size;
  }
}

// 싱글톤 인스턴스 export
export const tokenStore = TokenStore.getInstance();
