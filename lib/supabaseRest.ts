export type SupabaseResult<T> =
  | { ok: true; data: T; status: number }
  | { ok: false; error: string; status: number };

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.SUPABASE_SECRET_KEY ??
  process.env.SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured() {
  return Boolean(url && key);
}

function baseUrl() {
  if (!url) return "";
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<SupabaseResult<T>> {
  if (!url || !key) {
    return { ok: false, error: "Supabase environment variables are not configured.", status: 503 };
  }

  const headers = new Headers(init.headers);
  headers.set("apikey", key);
  headers.set("Authorization", `Bearer ${key}`);
  if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");

  try {
    const response = await fetch(`${baseUrl()}/rest/v1/${path}`, {
      ...init,
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      return { ok: false, error: text || response.statusText, status: response.status };
    }

    if (response.status === 204) {
      return { ok: true, data: null as T, status: response.status };
    }

    return { ok: true, data: (await response.json()) as T, status: response.status };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown Supabase request error.",
      status: 500,
    };
  }
}

export async function supabaseSelect<T>(
  table: string,
  query = "select=*",
): Promise<SupabaseResult<T[]>> {
  return request<T[]>(`${table}?${query}`);
}

export async function supabaseInsert<T>(
  table: string,
  body: unknown,
): Promise<SupabaseResult<T[]>> {
  return request<T[]>(table, {
    method: "POST",
    headers: {
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  });
}

export async function supabaseUpsert<T>(
  table: string,
  body: unknown,
  onConflict: string,
): Promise<SupabaseResult<T[]>> {
  return request<T[]>(`${table}?on_conflict=${encodeURIComponent(onConflict)}`, {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify(body),
  });
}

export async function supabaseDelete(
  table: string,
  query: string,
): Promise<SupabaseResult<null>> {
  return request<null>(`${table}?${query}`, {
    method: "DELETE",
    headers: {
      Prefer: "return=minimal",
    },
  });
}

export async function supabaseUpdate<T>(
  table: string,
  query: string,
  body: unknown,
): Promise<SupabaseResult<T[]>> {
  return request<T[]>(`${table}?${query}`, {
    method: "PATCH",
    headers: {
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  });
}
