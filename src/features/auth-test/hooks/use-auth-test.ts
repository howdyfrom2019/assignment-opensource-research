import { useState, useEffect } from "react";
import { isAxiosError, createAxiosInstance } from "@/lib/provider/axios";

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
    try {
      // 응답이 이미 JSON 객체인 경우 (dispatchRequest에서 JSON.parse를 시도했으므로)
      response.data = {
        originalData: response.data,
        message: "응답 인터셉터가 데이터를 변환했습니다.",
      };
    } catch (e) {
      // 파싱 실패 시 원본 데이터를 사용
      response.data = {
        originalData: response.data,
        message: "응답 인터셉터가 데이터를 변환했습니다. (raw text)",
      };
    }
    return response;
  },
  (error) => {
    console.error("[Response Interceptor Error]:", error);
    return Promise.reject(error);
  }
);

// 테스트 결과 타입 정의
type TestResult = {
  error?: string;
  message?: string;
  errorDetails?: any;
  status?: number;
  [key: string]: any;
};

type ResultsState = {
  loginTest: TestResult | null;
  refreshTest: TestResult | null;
  logoutTest: TestResult | null;
  protectedTest: TestResult | null;
  statusTest: TestResult | null;
};

export function useAuthTest() {
  const [results, setResults] = useState<ResultsState>({
    loginTest: null,
    refreshTest: null,
    logoutTest: null,
    protectedTest: null,
    statusTest: null,
  });

  const [isLoading, setIsLoading] = useState({
    login: false,
    refresh: false,
    logout: false,
    protected: false,
    status: false,
  });

  const [tokens, setTokens] = useState<{
    accessToken: string | null;
    refreshToken: string | null;
  }>({
    accessToken: null,
    refreshToken: null,
  });

  // 토큰 상태 변경 추적
  useEffect(() => {
    console.log("🔐 Tokens state changed:", tokens);
  }, [tokens]);

  // 로그인 테스트
  const handleLoginTest = async () => {
    setIsLoading((prev) => ({ ...prev, login: true }));
    try {
      const response = await myAxios.post("/api/auth/login");

      // 응답 인터셉터에 의해 변환된 데이터에서 토큰 추출
      const responseData = response.data.originalData || response.data;
      const { accessToken, refreshToken } = responseData;

      if (!accessToken || !refreshToken) {
        throw new Error("토큰이 응답에 포함되지 않았습니다.");
      }

      setTokens({ accessToken, refreshToken });
      setResults((prev) => ({ ...prev, loginTest: response.data }));

      console.log("Login successful:", { accessToken, refreshToken });
      console.log("Tokens state updated:", { accessToken, refreshToken });

      // 토큰 설정 후 상태 확인
      setTimeout(() => {
        console.log("🔍 Current tokens state after login:", tokens);
      }, 0);
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

      // 응답 인터셉터에 의해 변환된 데이터에서 토큰 추출
      const responseData = response.data.originalData || response.data;
      const { accessToken } = responseData;

      if (!accessToken) {
        throw new Error("새로운 accessToken이 응답에 포함되지 않았습니다.");
      }

      setTokens((prev) => ({ ...prev, accessToken }));
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

      // 로컬 토큰 상태 초기화
      setTokens({ accessToken: null, refreshToken: null });
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
