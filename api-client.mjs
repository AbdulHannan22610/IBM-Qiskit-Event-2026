export class ApiRequestError extends Error {
  constructor(message, kind, status = null) {
    super(message);
    this.name = 'ApiRequestError';
    this.kind = kind;
    this.status = status;
  }
}

export async function apiRequest(baseUrl, endpoint, options = {}, fetchImpl = globalThis.fetch) {
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const url = new URL(endpoint.replace(/^\/+/, ''), normalizedBaseUrl);
  const method = options.method || 'GET';
  let response;

  try {
    response = await fetchImpl(url, options);
  } catch (error) {
    console.warn('API connection failure', {
      method,
      origin: url.origin,
      path: url.pathname,
      errorName: error instanceof Error ? error.name : 'UnknownError'
    });
    throw new ApiRequestError(
      'Unable to contact the API. This may be a network/TLS issue, a CORS block, or an unavailable service. Check DevTools Network and Console for details.',
      'connection'
    );
  }

  let result = null;
  if (response.status !== 204) {
    try {
      result = await response.json();
    } catch {
      if (response.ok) {
        throw new ApiRequestError('The API returned an unreadable response.', 'protocol', response.status);
      }
    }
  }

  if (!response.ok) {
    const kind = response.status === 400 ? 'validation'
      : response.status === 401 ? 'authentication'
        : response.status === 409 ? 'conflict'
          : response.status >= 500 ? 'server'
            : 'http';
    const detail = typeof result?.error === 'string' ? result.error : 'API request failed.';
    console.warn('API request returned an error', { method, path: url.pathname, status: response.status });
    throw new ApiRequestError(`${detail} (HTTP ${response.status})`, kind, response.status);
  }

  return result;
}
