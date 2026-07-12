// Thin wrapper around the Heroku Platform API.
// Needs HEROKU_API_KEY in .env. Adjust `buildSourceUrl` if your bots
// live in a different repo/branch layout than a plain public GitHub repo.
const HEROKU_BASE = 'https://api.heroku.com';

function assertConfigured() {
  if (!process.env.HEROKU_API_KEY) {
    const err = new Error('HEROKU_API_KEY haijawekwa kwenye .env — deploy ya Heroku imesimamishwa.');
    err.statusCode = 500;
    throw err;
  }
}

function headers() {
  return {
    Authorization: `Bearer ${process.env.HEROKU_API_KEY}`,
    Accept: 'application/vnd.heroku+json; version=3',
    'Content-Type': 'application/json',
  };
}

async function herokuFetch(path, options = {}) {
  const res = await fetch(`${HEROKU_BASE}${path}`, { ...options, headers: headers() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Heroku API error (${res.status})`);
  }
  return data;
}

// Turns a plain GitHub repo URL into a tarball URL Heroku's Build API can pull from.
function buildSourceUrl(githubUrl, branch = 'main') {
  const clean = githubUrl.replace(/\.git$/, '').replace(/\/$/, '');
  return `${clean}/tarball/${branch}`;
}

async function deployToHeroku({ appNamePrefix, sessionId, ownerName, ownerNum, githubUrl }) {
  assertConfigured();

  // 1) Create the app (Heroku generates a unique name if we just pass a prefix-based hint)
  const appName = `${appNamePrefix}-${Date.now()}`.toLowerCase().slice(0, 30);
  const app = await herokuFetch('/apps', {
    method: 'POST',
    body: JSON.stringify({
      name: appName,
      ...(process.env.HEROKU_TEAM_NAME && { team: process.env.HEROKU_TEAM_NAME }),
    }),
  });

  // 2) Set the environment variables the bot needs at boot
  await herokuFetch(`/apps/${app.id}/config-vars`, {
    method: 'PATCH',
    body: JSON.stringify({
      SESSION_ID: sessionId,
      OWNER_NAME: ownerName,
      OWNER_NUMBER: ownerNum,
    }),
  });

  // 3) Trigger a build straight from the bot's GitHub repo
  const build = await herokuFetch(`/apps/${app.id}/builds`, {
    method: 'POST',
    body: JSON.stringify({ source_blob: { url: buildSourceUrl(githubUrl) } }),
  });

  return { externalRef: app.name, herokuAppId: app.id, buildId: build.id };
}

// Scales all dynos to 0 — effectively stops the app without deleting it,
// so a renewal can bring it straight back online.
async function stopHerokuApp(appName) {
  assertConfigured();
  const formation = await herokuFetch(`/apps/${appName}/formation`);
  await Promise.all(
    formation.map((f) =>
      herokuFetch(`/apps/${appName}/formation/${f.type}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity: 0 }),
      })
    )
  );
  return { stopped: true };
}

module.exports = { deployToHeroku, stopHerokuApp };
