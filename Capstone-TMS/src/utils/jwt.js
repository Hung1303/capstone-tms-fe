export function decodeJwt(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getRoleFromToken(token) {
  const payload = decodeJwt(token);
  if (!payload) return '';
  // Backend uses capitalized keys like Role
  const role = payload.Role || payload.role || '';
  return String(role).toLowerCase();
}

export function buildUserFromToken(token) {
  const payload = decodeJwt(token);
  if (!payload) return null;
  const role = (payload.Role || payload.role || '').toString().toLowerCase();
  return {
    id: payload.UserId || payload.sub || payload.userId || undefined,
    name: payload.UserName || payload.FullName || payload.name || undefined,
    email: payload.Email || payload.email || undefined,
    role,
    phoneNumber: payload.PhoneNumber || payload.phoneNumber || undefined,
    raw: payload,
  };
}


