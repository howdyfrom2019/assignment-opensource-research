import { useAtomValue } from "jotai";
import { authTokensAtom, isAuthenticatedAtom, userInfoAtom } from "@/lib/store";

export function AuthStatusDebug() {
  const tokens = useAtomValue(authTokensAtom);
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const userInfo = useAtomValue(userInfoAtom);

  return (
    <div className="fixed top-4 right-4 bg-gray-900/90 p-4 rounded-lg border border-gray-700 text-xs font-mono max-w-xs">
      <h3 className="text-white font-bold mb-2">🔐 Auth Status Debug</h3>
      <div className="space-y-2 text-gray-300">
        <div>
          <span className="text-gray-400">Status:</span>{" "}
          <span className={isAuthenticated ? "text-green-400" : "text-red-400"}>
            {isAuthenticated ? "Authenticated" : "Not Authenticated"}
          </span>
        </div>
        <div>
          <span className="text-gray-400">User:</span>{" "}
          <span className="text-white">{userInfo.username || "None"}</span>
        </div>
        <div>
          <span className="text-gray-400">Access Token:</span>{" "}
          <span className="text-white">
            {tokens.accessToken
              ? `${tokens.accessToken.substring(0, 20)}...`
              : "None"}
          </span>
        </div>
        <div>
          <span className="text-gray-400">Refresh Token:</span>{" "}
          <span className="text-white">
            {tokens.refreshToken
              ? `${tokens.refreshToken.substring(0, 20)}...`
              : "None"}
          </span>
        </div>
      </div>
    </div>
  );
}
