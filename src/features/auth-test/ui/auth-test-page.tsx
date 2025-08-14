import { BentoCard } from "@/components/bento-card";
import { useAuthTest } from "../hooks/use-auth-test";

export function AuthTestPage() {
  const {
    results,
    isLoading,
    tokens,
    handleLoginTest,
    handleRefreshTest,
    handleProtectedTest,
    handleLogoutTest,
    handleStatusTest,
  } = useAuthTest();

  return (
    <main className="min-h-screen bg-gray-950 text-gray-200 p-8 sm:p-12 md:p-16 lg:p-24 font-sans antialiased">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-center text-white leading-tight">
          인증 시스템 테스트
        </h1>
        <p className="text-center text-gray-400 mt-4 max-w-2xl mx-auto">
          JWT 기반 인증 시스템과 커스텀 Axios 라이브러리를 테스트합니다.
        </p>

        {/* 토큰 상태 표시 */}
        <div className="mt-8 bg-gray-900/50 p-6 rounded-2xl border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">현재 토큰 상태</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 p-4 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">
                Access Token
              </h3>
              <p className="text-xs font-mono text-gray-400 break-all">
                {tokens.accessToken
                  ? `${tokens.accessToken.substring(0, 20)}...`
                  : "없음"}
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">
                Refresh Token
              </h3>
              <p className="text-xs font-mono text-gray-400 break-all">
                {tokens.refreshToken
                  ? `${tokens.refreshToken.slice(0, 20)}...`
                  : "없음"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 로그인 테스트 카드 */}
          <BentoCard
            title="로그인"
            description="사용자 로그인을 수행하고 JWT 토큰을 발급받습니다. accessToken과 refreshToken을 받아옵니다."
            testFunction={handleLoginTest}
            isLoading={isLoading.login}
          >
            <div className="bg-gray-800 p-4 rounded-xl text-xs font-mono overflow-auto h-40">
              <pre>
                {results.loginTest
                  ? JSON.stringify(results.loginTest, null, 2)
                  : "결과가 여기에 표시됩니다."}
              </pre>
            </div>
          </BentoCard>

          {/* 토큰 갱신 테스트 카드 */}
          <BentoCard
            title="토큰 갱신"
            description="refreshToken을 사용하여 새로운 accessToken을 발급받습니다. 먼저 로그인이 필요합니다."
            testFunction={handleRefreshTest}
            isLoading={isLoading.refresh}
          >
            <div className="bg-gray-800 p-4 rounded-xl text-xs font-mono overflow-auto h-40">
              <pre>
                {results.refreshTest
                  ? JSON.stringify(results.refreshTest, null, 2)
                  : "결과가 여기에 표시됩니다."}
              </pre>
            </div>
          </BentoCard>

          {/* 보호된 리소스 접근 테스트 카드 */}
          <BentoCard
            title="보호된 리소스"
            description="유효한 accessToken을 사용하여 보호된 API에 접근합니다. 먼저 로그인이 필요합니다."
            testFunction={handleProtectedTest}
            isLoading={isLoading.protected}
          >
            <div className="bg-gray-800 p-4 rounded-xl text-xs font-mono overflow-auto h-40">
              <pre>
                {results.protectedTest
                  ? JSON.stringify(results.protectedTest, null, 2)
                  : "결과가 여기에 표시됩니다."}
              </pre>
            </div>
          </BentoCard>

          {/* 로그아웃 테스트 카드 */}
          <BentoCard
            title="로그아웃"
            description="refreshToken을 사용하여 로그아웃을 수행합니다. 토큰이 서버에서 삭제됩니다."
            testFunction={handleLogoutTest}
            isLoading={isLoading.logout}
          >
            <div className="bg-gray-800 p-4 rounded-xl text-xs font-mono overflow-auto h-40">
              <pre>
                {results.logoutTest
                  ? JSON.stringify(results.logoutTest, null, 2)
                  : "결과가 여기에 표시됩니다."}
              </pre>
            </div>
          </BentoCard>

          {/* 토큰 상태 확인 테스트 카드 */}
          <BentoCard
            title="토큰 상태"
            description="현재 서버에 저장된 모든 토큰의 상태를 확인합니다. 만료된 토큰은 자동으로 정리됩니다."
            testFunction={handleStatusTest}
            isLoading={isLoading.status}
          >
            <div className="bg-gray-800 p-4 rounded-xl text-xs font-mono overflow-auto h-40">
              <pre>
                {results.statusTest
                  ? JSON.stringify(results.statusTest, null, 2)
                  : "결과가 여기에 표시됩니다."}
              </pre>
            </div>
          </BentoCard>
        </div>

        {/* 테스트 시나리오 안내 */}
        <div className="mt-16 bg-blue-900/20 p-6 rounded-2xl border border-blue-700">
          <h2 className="text-xl font-bold text-blue-300 mb-4">
            테스트 시나리오
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-200">
            <li>
              먼저 <strong>로그인</strong>을 실행하여 토큰을 발급받습니다.
            </li>
            <li>
              <strong>토큰 갱신</strong>을 테스트하여 refreshToken이 정상
              작동하는지 확인합니다.
            </li>
            <li>
              <strong>보호된 리소스</strong>에 접근하여 accessToken 인증이 정상
              작동하는지 확인합니다.
            </li>
            <li>
              <strong>토큰 상태</strong>를 확인하여 서버에 저장된 토큰 정보를
              봅니다.
            </li>
            <li>
              마지막으로 <strong>로그아웃</strong>을 실행하여 토큰이 정상적으로
              삭제되는지 확인합니다.
            </li>
          </ol>
        </div>
      </div>
    </main>
  );
}
