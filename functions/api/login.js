function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

export async function onRequestPost({ request, env }) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
    const supabaseResponse = await fetch(
      `${env.SUPABASE_URL}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          apikey: env.SUPABASE_ANON_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: body.email,
          password: body.password
        })
      }
    );

    const result = await supabaseResponse.json();
    if (!supabaseResponse.ok) {
      return json(
        { error: result.error_description || "Invalid credentials" },
        401
      );
    }

    return json({ token: result.access_token, user: result.user });
  }

  return json({ error: "Cloudflare backend is not configured yet" }, 503);
}
