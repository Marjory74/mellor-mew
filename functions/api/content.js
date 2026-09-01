const seedContent = {
  intro: "สวัสดีค่ะ ยินดีต้อนรับเข้าสู่สวนเล็ก ๆ ของเรา ♡",
  introEn:
    "Hi! Welcome to our tiny apple garden. This is a cozy place for my OCs, their worlds, and little stories."
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function supabaseConfigured(env) {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

async function supabaseFetch(env, path, options = {}) {
  return fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
}

export async function onRequestGet({ env }) {
  if (!supabaseConfigured(env)) {
    return json(seedContent);
  }

  try {
    const result = await supabaseFetch(
      env,
      "site_content?id=eq.main&select=data"
    );

    if (!result.ok) {
      return json(seedContent);
    }

    const rows = await result.json();
    return json(rows[0]?.data || seedContent);
  } catch {
    return json(seedContent);
  }
}

export async function onRequestPatch({ request, env }) {
  const authorization = request.headers.get("authorization") || "";

  if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
    try {
      const userResponse = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
        headers: {
          apikey: env.SUPABASE_ANON_KEY,
          Authorization: authorization
        }
      });
      const user = await userResponse.json();

      if (
        !userResponse.ok ||
        (env.ADMIN_EMAIL && user.email !== env.ADMIN_EMAIL)
      ) {
        return json({ error: "Unauthorized" }, 401);
      }
    } catch {
      return json({ error: "Unauthorized" }, 401);
    }
  } else {
    return json({ error: "Cloudflare backend is not configured yet" }, 503);
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  if (!supabaseConfigured(env)) {
    return json({
      ...seedContent,
      ...body,
      saved: false,
      message: "Local demo mode"
    });
  }

  try {
    const result = await supabaseFetch(
      env,
      "site_content?on_conflict=id",
      {
        method: "POST",
        headers: {
          Prefer: "resolution=merge-duplicates,return=representation"
        },
        body: JSON.stringify({ id: "main", data: body })
      }
    );

    if (!result.ok) {
      return json({ error: "Could not save content" }, 500);
    }

    return json({ ...body, saved: true });
  } catch {
    return json({ error: "Could not save content" }, 500);
  }
}
