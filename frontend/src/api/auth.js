export const authFetch = async (url, options = {}) => {
  const token = getToken();

  const headers = {
    ...options.headers,
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const isJson =
    options.body &&
    typeof options.body === "object" &&
    !(options.body instanceof FormData);

  const requestOptions = {
    method: options.method || "GET",
    ...options,
    headers,
    body: isJson ? JSON.stringify(options.body) : options.body,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  requestOptions.signal = controller.signal;

  try {
    const res = await fetch(`${API_URL}${url}`, requestOptions);
    return handleResponse(res);
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error(`Request to ${url} timed out after 15s`);
    }
    throw new Error("Network error. Server unreachable.");
  } finally {
    clearTimeout(timeout);
  }
};
