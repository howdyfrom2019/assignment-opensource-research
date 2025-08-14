import { useAtom, useAtomValue } from "jotai";
import { isAxiosError, createAxiosInstance } from "@/lib/provider/axios";
import {
  authTokensAtom,
  authLoadingAtom,
  authTestResultsAtom,
  setAuthTokensAtom,
  updateAccessTokenAtom,
  resetAuthStateAtom,
} from "@/lib/store";

// 커스텀 axios 인스턴스를 생성합니다.
const myAxios = createAxiosInstance();

// 요청 인터셉터: 모든 요청에 'x-test-header'를 추가합니다.
myAxios.interceptors.request.use(
  (config) => {
    console.log("[Request Interceptor]: 요청 인터셉터가 동작했습니다.");
    config.headers = {
      ...config.headers,
      "x-test-header": "interceptor-works",
    };
    return config;
  },
  (error) => {
    console.error("[Request Interceptor Error]:", error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 응답 데이터를 감싸거나 에러를 처리합니다.
myAxios.interceptors.response.use(
  (response) => {
    console.log("[Response Interceptor]: 응답 인터셉터가 동작했습니다.");
    // JSON 파싱이 이미 dispatchRequest에서 처리되었으므로 추가 변환 없이 로깅만
    console.log(
      "[Response Interceptor]: Original response data:",
      response.data
    );
    return response;
  },
  (error) => {
    console.error("[Response Interceptor Error]:", error);
    return Promise.reject(error);
  }
);

// 테스트 결과 타입 정의 (auth-store에서 import)

export function useAuthTest() {
  const [results, setResults] = useAtom(authTestResultsAtom);
  const [isLoading, setIsLoading] = useAtom(authLoadingAtom);
  const [tokens, setTokens] = useAtom(authTokensAtom);
  const setAuthTokens = useAtom(setAuthTokensAtom)[1];
  const updateAccessToken = useAtom(updateAccessTokenAtom)[1];
  const resetAuthState = useAtom(resetAuthStateAtom)[1];

  // 로그인 테스트
  const handleLoginTest = async () => {
    setIsLoading((prev) => ({ ...prev, login: true }));
    try {
      const response = await myAxios.post("/api/auth/login");

      // JSON 파싱이 이미 dispatchRequest에서 처리되었으므로 직접 추출
      const { accessToken, refreshToken } = response.data;

      if (!accessToken || !refreshToken) {
        throw new Error("토큰이 응답에 포함되지 않았습니다.");
      }

      setAuthTokens({ accessToken, refreshToken });
      setResults((prev) => ({ ...prev, loginTest: response.data }));

      console.log("Login successful:", { accessToken, refreshToken });
      console.log("Tokens state updated:", { accessToken, refreshToken });
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        loginTest: { error: "로그인에 실패했습니다." },
      }));
      console.error("Login error:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, login: false }));
    }
  };

  // 토큰 갱신 테스트
  const handleRefreshTest = async () => {
    if (!tokens.refreshToken) {
      setResults((prev) => ({
        ...prev,
        refreshTest: { error: "먼저 로그인을 해주세요." },
      }));
      return;
    }

    setIsLoading((prev) => ({ ...prev, refresh: true }));
    try {
      const response = await myAxios.post("/api/auth/refresh", {
        refreshToken: tokens.refreshToken,
      });

      // JSON 파싱이 이미 dispatchRequest에서 처리되었으므로 직접 추출
      const { accessToken } = response.data;

      if (!accessToken) {
        throw new Error("새로운 accessToken이 응답에 포함되지 않았습니다.");
      }

      updateAccessToken(accessToken);
      setResults((prev) => ({ ...prev, refreshTest: response.data }));

      console.log("Token refresh successful:", { accessToken });
      console.log("Updated tokens state:", {
        accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        refreshTest: { error: "토큰 갱신에 실패했습니다." },
      }));
      console.error("Refresh error:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, refresh: false }));
    }
  };

  // 보호된 리소스 접근 테스트
  const handleProtectedTest = async () => {
    if (!tokens.accessToken) {
      setResults((prev) => ({
        ...prev,
        protectedTest: { error: "먼저 로그인을 해주세요." },
      }));
      return;
    }

    setIsLoading((prev) => ({ ...prev, protected: true }));
    try {
      const response = await myAxios.get("/api/protected", {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      setResults((prev) => ({ ...prev, protectedTest: response.data }));
      console.log("Protected resource access successful");
    } catch (error) {
      if (isAxiosError(error)) {
        setResults((prev) => ({
          ...prev,
          protectedTest: {
            message: "보호된 리소스 접근 실패",
            errorDetails: error.response?.data,
            status: error.response?.status,
          },
        }));
      } else {
        setResults((prev) => ({
          ...prev,
          protectedTest: { error: "알 수 없는 에러가 발생했습니다." },
        }));
      }
      console.error("Protected access error:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, protected: false }));
    }
  };

  // 로그아웃 테스트
  const handleLogoutTest = async () => {
    if (!tokens.refreshToken) {
      setResults((prev) => ({
        ...prev,
        logoutTest: { error: "먼저 로그인을 해주세요." },
      }));
      return;
    }

    setIsLoading((prev) => ({ ...prev, logout: true }));
    try {
      const response = await myAxios.post("/api/auth/logout", {
        refreshToken: tokens.refreshToken,
      });

      // 전역 인증 상태 초기화
      resetAuthState();
      setResults((prev) => ({ ...prev, logoutTest: response.data }));

      console.log("Logout successful");
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        logoutTest: { error: "로그아웃에 실패했습니다." },
      }));
      console.error("Logout error:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, logout: false }));
    }
  };

  // 토큰 상태 확인 테스트
  const handleStatusTest = async () => {
    setIsLoading((prev) => ({ ...prev, status: true }));
    try {
      const response = await myAxios.get("/api/auth/status");
      setResults((prev) => ({ ...prev, statusTest: response.data }));
      console.log("Token status check successful");
    } catch (error) {
      if (isAxiosError(error)) {
        setResults((prev) => ({
          ...prev,
          statusTest: {
            message: "토큰 상태 확인 실패",
            errorDetails: error.response?.data,
            status: error.response?.status,
          },
        }));
      } else {
        setResults((prev) => ({
          ...prev,
          statusTest: { error: "알 수 없는 에러가 발생했습니다." },
        }));
      }
      console.error("Status check error:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, status: false }));
    }
  };

  return {
    results,
    isLoading,
    tokens,
    handleLoginTest,
    handleRefreshTest,
    handleProtectedTest,
    handleLogoutTest,
    handleStatusTest,
  };
}
