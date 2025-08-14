// --- JWT 로직을 위한 간단한 모킹 함수 ---
export const JWT_SECRET = "my-secret-key-for-test";
export const ACCESS_TOKEN_EXPIRY = 1000 * 10; // 10초
export const REFRESH_TOKEN_EXPIRY = 1000 * 60 * 60; // 1시간 (테스트를 위해 짧게 설정)
