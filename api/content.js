const seedContent = {
  intro: 'สวัสดีค่ะ ยินดีต้อนรับเข้าสู่สวนเล็ก ๆ ของเรา ♡',
  introEn: 'Hi! Welcome to our tiny apple garden. This is a cozy place for my OCs, their worlds, and little stories.'
};

function supabaseConfigured() {
  return process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY;
}

async function supabaseFetch(path, options = {}) {
  return fetch(`${process.env.SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
}

export default async function handler(request, response) {
  if (request.method === 'GET') {
    if (!supabaseConfigured()) return response.status(200).json(seedContent);
    const result = await supabaseFetch('site_content?id=eq.main&select=data');
    if (!result.ok) return response.status(200).json(seedContent);
    const rows = await result.json();
    return response.status(200).json(rows[0]?.data || seedContent);
  }

  if (request.method === 'PATCH') {
    const auth = request.headers.authorization || '';
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      const userResponse = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, { headers: { apikey: process.env.SUPABASE_ANON_KEY, Authorization: auth } });
      const user = await userResponse.json();
      if (!userResponse.ok || (process.env.ADMIN_EMAIL && user.email !== process.env.ADMIN_EMAIL)) return response.status(401).json({ error: 'Unauthorized' });
    } else {
      const expected = process.env.ADMIN_TOKEN || 'demo-admin-token';
      if (auth !== `Bearer ${expected}`) return response.status(401).json({ error: 'Unauthorized' });
    }
    let body = {};
    try { body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body || {}; } catch { return response.status(400).json({ error: 'Invalid request' }); }
    if (!supabaseConfigured()) return response.status(200).json({ ...seedContent, ...body, saved: false, message: 'Local demo mode' });
    const result = await supabaseFetch('site_content?on_conflict=id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify({ id: 'main', data: body }) });
    if (!result.ok) return response.status(500).json({ error: 'Could not save content' });
    return response.status(200).json({ ...body, saved: true });
  }

  return response.status(405).json({ error: 'Method not allowed' });
}
