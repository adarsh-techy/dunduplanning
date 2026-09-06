// Single place that reads Vite env vars for the whole frontend. Vite only
// exposes variables prefixed VITE_ to client code (see client/.env.example),
// and only ever at build time -- so double-check these are set before you
// run `npm run build` for a deploy, not after.

// Where the API lives.
// DEV:    leave VITE_API_URL unset -- requests go to the relative "/api",
//         which vite.config.js's dev proxy forwards to the local backend.
// HOSTED: set VITE_API_URL to the deployed backend's full URL, e.g.
//         https://dundu-planning-api.onrender.com/api -- there's no dev
//         proxy in a production build, so this must be absolute.
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Attachments are served from the backend's /uploads path, not through
// /api. When the frontend and API share an origin (dev proxy, or a hosted
// setup behind one reverse proxy) a relative path just works. When they're
// on separate domains, an attachment link needs the API's real origin
// prepended -- derived here from API_BASE_URL so there's only one URL to
// configure.
const SERVER_ORIGIN = API_BASE_URL.startsWith('http') ? new URL(API_BASE_URL).origin : '';

// Turns an attachment's stored path (e.g. "/uploads/167...-file.pdf") into a
// URL that resolves correctly in both setups above. Already-absolute paths
// (shouldn't normally occur, but safe to pass through) are left untouched.
export const resolveFileUrl = (filePath) => {
  if (!filePath) return filePath;
  return filePath.startsWith('http') ? filePath : `${SERVER_ORIGIN}${filePath}`;
};
