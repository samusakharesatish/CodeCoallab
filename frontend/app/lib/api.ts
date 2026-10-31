// frontend/app/lib/api.ts

let isRefreshing = false;
let refreshSubscribers: ((token: string | null) => void)[] = [];

function onRefreshed(token: string | null) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string | null) => void) {
  refreshSubscribers.push(callback);
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * Enhanced fetch wrapper with automatic silent token refresh.
 * Uses NEXT_PUBLIC_API_URL strictly from environment (.env.local in dev).
 */
export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const url = input.startsWith("http")
    ? input
    : `${API_URL}${input.startsWith("/") ? "" : "/"}${input}`;

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers = new Headers(init.headers || {});
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(url, { ...init, headers });
  } catch (err) {
    throw err;
  }

  // If unauthorized / forbidden, try silent refresh
  if (response.status === 401 || response.status === 403) {
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;

    if (!refreshToken) {
      handleAuthFailure();
      return response;
    }

    if (!isRefreshing) {
      isRefreshing = true;

      try {
        const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          const newAccessToken = data.accessToken || data.token;
          const newRefreshToken = data.refreshToken;

          if (newAccessToken) {
            localStorage.setItem("token", newAccessToken);
            if (newRefreshToken) {
              localStorage.setItem("refreshToken", newRefreshToken);
            }
            onRefreshed(newAccessToken);

            // Retry original request with newly refreshed token
            headers.set("Authorization", `Bearer ${newAccessToken}`);
            return await fetch(url, { ...init, headers });
          }
        }

        // If refresh fails (refresh token expired)
        onRefreshed(null);
        handleAuthFailure();
        return response;
      } catch (err) {
        onRefreshed(null);
        handleAuthFailure();
        return response;
      } finally {
        isRefreshing = false;
      }
    } else {
      // Another request is already refreshing the token, wait for it
      return new Promise<Response>((resolve) => {
        addRefreshSubscriber(async (newToken) => {
          if (newToken) {
            headers.set("Authorization", `Bearer ${newToken}`);
            try {
              const retried = await fetch(url, { ...init, headers });
              resolve(retried);
            } catch {
              resolve(response);
            }
          } else {
            resolve(response);
          }
        });
      });
    }
  }

  return response;
}

function handleAuthFailure() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    if (!window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/register")) {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
    }
  }
}
