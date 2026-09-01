export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });

  let body = {};
  try { body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body || {}; } catch { return response.status(400).json({ error: 'Invalid request' }); }

  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    const supabaseResponse = await fetch(`${process.env.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { apikey: process.env.SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: body.email, password: body.password })
    });
    const result = await supabaseResponse.json();
    if (!supabaseResponse.ok) return response.status(401).json({ error: result.error_description || 'Invalid credentials' });
    return response.status(200).json({ token: result.access_token, user: result.user });
  }

  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'appletree';
  if (body.email !== email || body.password !== password) return response.status(401).json({ error: 'Invalid credentials' });

  return response.status(200).json({ token: process.env.ADMIN_TOKEN || 'demo-admin-token' });
}
