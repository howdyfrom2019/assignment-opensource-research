import { atom } from "jotai";

// 인증 토큰 상태
export const authTokensAtom = atom<{
  accessToken: string | null;
  refreshToken: string | null;
}>({
  accessToken: null,
  refreshToken: null,
});

// 인증 상태 (로그인 여부)
export const isAuthenticatedAtom = atom((get) => {
  const tokens = get(authTokensAtom);
  return !!(tokens.accessToken && tokens.refreshToken);
});

// 사용자 정보 상태
export const userInfoAtom = atom<{
  id: string | null;
  username: string | null;
}>({
  id: null,
  username: null,
});

// 로딩 상태
export const authLoadingAtom = atom<{
  login: boolean;
  refresh: boolean;
  logout: boolean;
  protected: boolean;
  status: boolean;
}>({
  login: false,
  refresh: false,
  logout: false,
  protected: false,
  status: false,
});

// 테스트 결과 상태
export type TestResult = {
  error?: string;
  message?: string;
  errorDetails?: any;
  status?: number;
  [key: string]: any;
};

export const authTestResultsAtom = atom<{
  loginTest: TestResult | null;
  refreshTest: TestResult | null;
  logoutTest: TestResult | null;
  protectedTest: TestResult | null;
  statusTest: TestResult | null;
}>({
  loginTest: null,
  refreshTest: null,
  logoutTest: null,
  protectedTest: null,
  statusTest: null,
});

// 인증 상태 초기화
export const resetAuthStateAtom = atom(null, (get, set) => {
  set(authTokensAtom, { accessToken: null, refreshToken: null });
  set(userInfoAtom, { id: null, username: null });
  set(authTestResultsAtom, {
    loginTest: null,
    refreshTest: null,
    logoutTest: null,
    protectedTest: null,
    statusTest: null,
  });
});

// 토큰 설정
export const setAuthTokensAtom = atom(
  null,
  (get, set, tokens: { accessToken: string; refreshToken: string }) => {
    set(authTokensAtom, tokens);
    // 사용자 정보도 함께 설정 (토큰에서 추출 가능한 경우)
    if (tokens.accessToken) {
      try {
        // JWT 토큰에서 사용자 정보 추출 (실제로는 verifyToken 사용)
        set(userInfoAtom, { id: "user123", username: "testuser" });
      } catch (e) {
        console.warn("Failed to extract user info from token");
      }
    }
  }
);

// 액세스 토큰만 업데이트 (토큰 갱신 시)
export const updateAccessTokenAtom = atom(
  null,
  (get, set, accessToken: string) => {
    const currentTokens = get(authTokensAtom);
    set(authTokensAtom, { ...currentTokens, accessToken });
  }
);
