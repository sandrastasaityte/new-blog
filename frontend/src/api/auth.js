export const authFetch = async (url, options = {}) => {
  if (!API_URL) throw new Error("API_URL is not defined. Check your env variables.");

  const { token = getToken(), timeout = 15000, headers: customHeaders, ...fetchOptions } = options;

  const isJson =
    fetchOptions.body &&
    typeof fetchOptions.body === "object" &&
    !(fetchOptions.body instanceof FormData);

  const headers = {
    ...(isJson && { "Content-Type": "application/json" }),
    ...(customHeaders || {}),
    ...(token && { Authorization: `Bearer ${token}` }),
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

    return await handleResponse(res);
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
