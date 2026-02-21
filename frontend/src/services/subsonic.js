import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const COOKIE_KEY = 'subsonic_settings';

// ── MD5 implementation (required for Subsonic token authentication) ──────────
// Based on RFC 1321, public domain algorithm.
function md5(str) {
  function safeAdd(x, y) {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }
  function rotl(x, n) { return (x << n) | (x >>> (32 - n)); }
  function cmn(q, a, b, x, s, t) { return safeAdd(rotl(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b); }
  function ff(a, b, c, d, x, s, t) { return cmn((b & c) | (~b & d), a, b, x, s, t); }
  function gg(a, b, c, d, x, s, t) { return cmn((b & d) | (c & ~d), a, b, x, s, t); }
  function hh(a, b, c, d, x, s, t) { return cmn(b ^ c ^ d, a, b, x, s, t); }
  function ii(a, b, c, d, x, s, t) { return cmn(c ^ (b | ~d), a, b, x, s, t); }

  // Convert string to UTF-8 byte array using TextEncoder
  const bytes = Array.from(new TextEncoder().encode(str));

  // Pre-processing: adding padding bits
  const origLen = bytes.length;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  // Append bit length as 64-bit little-endian
  const bitLen = origLen * 8;
  for (let i = 0; i < 8; i++) bytes.push(i < 4 ? (bitLen >>> (i * 8)) & 0xff : 0);

  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;

  for (let i = 0; i < bytes.length; i += 64) {
    const m = [];
    for (let j = 0; j < 16; j++) {
      m[j] = bytes[i + j * 4] |
             (bytes[i + j * 4 + 1] << 8) |
             (bytes[i + j * 4 + 2] << 16) |
             (bytes[i + j * 4 + 3] << 24);
    }
    let [aa, bb, cc, dd] = [a, b, c, d];
    /* Round 1 */ a=ff(a,b,c,d,m[0],7,-680876936); d=ff(d,a,b,c,m[1],12,-389564586); c=ff(c,d,a,b,m[2],17,606105819); b=ff(b,c,d,a,m[3],22,-1044525330); a=ff(a,b,c,d,m[4],7,-176418897); d=ff(d,a,b,c,m[5],12,1200080426); c=ff(c,d,a,b,m[6],17,-1473231341); b=ff(b,c,d,a,m[7],22,-45705983); a=ff(a,b,c,d,m[8],7,1770035416); d=ff(d,a,b,c,m[9],12,-1958414417); c=ff(c,d,a,b,m[10],17,-42063); b=ff(b,c,d,a,m[11],22,-1990404162); a=ff(a,b,c,d,m[12],7,1804603682); d=ff(d,a,b,c,m[13],12,-40341101); c=ff(c,d,a,b,m[14],17,-1502002290); b=ff(b,c,d,a,m[15],22,1236535329);
    /* Round 2 */ a=gg(a,b,c,d,m[1],5,-165796510); d=gg(d,a,b,c,m[6],9,-1069501632); c=gg(c,d,a,b,m[11],14,643717713); b=gg(b,c,d,a,m[0],20,-373897302); a=gg(a,b,c,d,m[5],5,-701558691); d=gg(d,a,b,c,m[10],9,38016083); c=gg(c,d,a,b,m[15],14,-660478335); b=gg(b,c,d,a,m[4],20,-405537848); a=gg(a,b,c,d,m[9],5,568446438); d=gg(d,a,b,c,m[14],9,-1019803690); c=gg(c,d,a,b,m[3],14,-187363961); b=gg(b,c,d,a,m[8],20,1163531501); a=gg(a,b,c,d,m[13],5,-1444681467); d=gg(d,a,b,c,m[2],9,-51403784); c=gg(c,d,a,b,m[7],14,1735328473); b=gg(b,c,d,a,m[12],20,-1926607734);
    /* Round 3 */ a=hh(a,b,c,d,m[5],4,-378558); d=hh(d,a,b,c,m[8],11,-2022574463); c=hh(c,d,a,b,m[11],16,1839030562); b=hh(b,c,d,a,m[14],23,-35309556); a=hh(a,b,c,d,m[1],4,-1530992060); d=hh(d,a,b,c,m[4],11,1272893353); c=hh(c,d,a,b,m[7],16,-155497632); b=hh(b,c,d,a,m[10],23,-1094730640); a=hh(a,b,c,d,m[13],4,681279174); d=hh(d,a,b,c,m[0],11,-358537222); c=hh(c,d,a,b,m[3],16,-722521979); b=hh(b,c,d,a,m[6],23,76029189); a=hh(a,b,c,d,m[9],4,-640364487); d=hh(d,a,b,c,m[12],11,-421815835); c=hh(c,d,a,b,m[15],16,530742520); b=hh(b,c,d,a,m[2],23,-995338651);
    /* Round 4 */ a=ii(a,b,c,d,m[0],6,-198630844); d=ii(d,a,b,c,m[7],10,1126891415); c=ii(c,d,a,b,m[14],15,-1416354905); b=ii(b,c,d,a,m[5],21,-57434055); a=ii(a,b,c,d,m[12],6,1700485571); d=ii(d,a,b,c,m[3],10,-1894986606); c=ii(c,d,a,b,m[10],15,-1051523); b=ii(b,c,d,a,m[1],21,-2054922799); a=ii(a,b,c,d,m[8],6,1873313359); d=ii(d,a,b,c,m[15],10,-30611744); c=ii(c,d,a,b,m[6],15,-1560198380); b=ii(b,c,d,a,m[13],21,1309151649); a=ii(a,b,c,d,m[4],6,-145523070); d=ii(d,a,b,c,m[11],10,-1120210379); c=ii(c,d,a,b,m[2],15,718787259); b=ii(b,c,d,a,m[9],21,-343485551);

    a = safeAdd(a, aa); b = safeAdd(b, bb); c = safeAdd(c, cc); d = safeAdd(d, dd);
  }

  return [a, b, c, d]
    .map(n => Array.from({ length: 4 }, (_, i) => ((n >>> (i * 8)) & 0xff).toString(16).padStart(2, '0')).join(''))
    .join('');
}

// ── Cookie helpers ────────────────────────────────────────────────────────────

export function getSubsonicSettings() {
  const match = document.cookie.match(new RegExp('(?:^|; )' + COOKIE_KEY + '=([^;]*)'));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

export function saveSubsonicSettings({ server, username, password }) {
  // Sanitize server URL: trim whitespace and remove trailing slashes
  const cleanServer = server.trim().replace(/\/+$/, '');
  const settings = { server: cleanServer, username: username.trim(), password };
  // NOTE: Storing password in cookie per requirement. This transmits the
  // password to the backend proxy. Use HTTPS in production.
  const encoded = encodeURIComponent(JSON.stringify(settings));
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${COOKIE_KEY}=${encoded}; path=/; SameSite=Strict${secure}`;
}

export function clearSubsonicSettings() {
  document.cookie = `${COOKIE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
}

// ── Credential generation ─────────────────────────────────────────────────────

/**
 * Generates Subsonic REST API authentication credentials per spec:
 *   u = username
 *   s = random salt (generated per request)
 *   t = md5(password + salt)
 */
export function generateCredentials(username, password) {
  const saltBytes = crypto.getRandomValues(new Uint8Array(8));
  const salt = Array.from(saltBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  const token = md5(password + salt);
  return { u: username, t: token, s: salt };
}

// ── Subsonic API client ───────────────────────────────────────────────────────

export const subsonicAPI = {
  isConfigured() {
    const s = getSubsonicSettings();
    return !!(s?.server && s?.username && s?.password);
  },

  async ping() {
    const settings = getSubsonicSettings();
    if (!settings) throw new Error('Subsonic not configured');
    const { u, t, s } = generateCredentials(settings.username, settings.password);
    const response = await axios.get(`${API_BASE_URL}/subsonic/ping`, {
      params: { server: settings.server, u, t, s },
    });
    return response.data;
  },

  async search(query) {
    const settings = getSubsonicSettings();
    if (!settings) return null;
    const { u, t, s } = generateCredentials(settings.username, settings.password);
    const response = await axios.get(`${API_BASE_URL}/subsonic/search`, {
      params: { server: settings.server, u, t, s, query },
    });
    return response.data;
  },

  /**
   * Returns a URL pointing to the backend cover-art proxy.
   * Credentials are generated fresh (new salt) each call.
   */
  getCoverArtUrl(id, size = 300) {
    const settings = getSubsonicSettings();
    if (!settings || !id) return null;
    const { u, t, s } = generateCredentials(settings.username, settings.password);
    const params = new URLSearchParams({
      server: settings.server,
      u,
      t,
      s,
      size: String(size),
    });
    return `${API_BASE_URL}/subsonic/cover-art/${encodeURIComponent(id)}?${params}`;
  },

  /**
   * Searches Subsonic for an artist by name and returns the coverArt id,
   * or null if not found / Subsonic not configured.
   */
  async getArtistCoverArtId(name) {
    try {
      const data = await this.search(name);
      const result = data?.['subsonic-response']?.searchResult3;
      return result?.artist?.[0]?.coverArt ?? null;
    } catch {
      return null;
    }
  },

  /**
   * Searches Subsonic for a song by title + artist and returns the coverArt id,
   * or null if not found / Subsonic not configured.
   */
  async getSongCoverArtId(title, artist) {
    try {
      const data = await this.search(`${title} ${artist}`);
      const result = data?.['subsonic-response']?.searchResult3;
      return result?.song?.[0]?.coverArt ?? result?.album?.[0]?.coverArt ?? null;
    } catch {
      return null;
    }
  },
};
