export const authFetch = async (url, options = {}) => {
  if (!API_URL) throw new Error("API_URL is not defined. Check your env variables.");

  const { token: optToken, timeout = 15000, headers: customHeaders, ...fetchOptions } = options;

  // Lazy token
  const token = optToken ?? getToken?.();

  // Detect if body is JSON-serializable
  const isJson =
    fetchOptions.body &&
    typeof fetchOptions.body === "object" &&
    !(fetchOptions.body instanceof FormData);

  const headers = {
    ...(isJson && { "Content-Type": "application/json" }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(customHeaders || {}), // customHeaders override defaults
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${API_URL}${url}`, {
      ...fetchOptions,
      method: fetchOptions.method ?? "GET",
      headers,
      signal: controller.signal,
      ...(fetchOptions.body != null && {
        body: isJson ? JSON.stringify(fetchOptions.body) : fetchOptions.body,
      }),
    });

    // Automatic JSON parsing if possible
    const contentType = res.headers.get("Content-Type") || "";
    let data;
    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      const errorMessage = data?.message || res.statusText;
      throw new Error(`HTTP ${res.status}: ${errorMessage}`);
    }

    return data;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error(`${fetchOptions.method ?? "GET"} request to ${url} timed out after ${timeout / 1000}s`);
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      throw new Error("No internet connection.");
    }

    throw err instanceof Error ? err : new Error(`Network error: ${String(err)}`);
  } finally {
    clearTimeout(timeoutId);
  }
};
