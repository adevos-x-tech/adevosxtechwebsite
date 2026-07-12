// Thin wrapper around the Pterodactyl Application API.
// Needs PTERODACTYL_PANEL_URL, PTERODACTYL_API_KEY, PTERODACTYL_EGG_ID,
// PTERODACTYL_NEST_ID, PTERODACTYL_DEFAULT_USER_ID in .env.
// The exact "docker_image" / "startup" values depend entirely on the Egg
// you configure on your own panel — adjust DEFAULT_STARTUP below to match.

function assertConfigured() {
  const required = [
    'PTERODACTYL_PANEL_URL',
    'PTERODACTYL_API_KEY',
    'PTERODACTYL_EGG_ID',
    'PTERODACTYL_NEST_ID',
    'PTERODACTYL_DEFAULT_USER_ID',
  ];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    const err = new Error(`Pterodactyl env vars hazijawekwa: ${missing.join(', ')}`);
    err.statusCode = 500;
    throw err;
  }
}

function headers() {
  return {
    Authorization: `Bearer ${process.env.PTERODACTYL_API_KEY}`,
    Accept: 'Application/vnd.pterodactyl.v1+json',
    'Content-Type': 'application/json',
  };
}

async function pteroFetch(path, options = {}) {
  const base = process.env.PTERODACTYL_PANEL_URL.replace(/\/$/, '');
  const res = await fetch(`${base}${path}`, { ...options, headers: headers() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data.errors?.[0]?.detail || `Pterodactyl API error (${res.status})`;
    throw new Error(message);
  }
  return data;
}

async function deployToPanel({ serverName, sessionId, ownerName, ownerNum, githubUrl }) {
  assertConfigured();

  const startupCommand = `git clone ${githubUrl} . && npm install && npm start`;

  const payload = {
    name: serverName.slice(0, 60),
    user: Number(process.env.PTERODACTYL_DEFAULT_USER_ID),
    egg: Number(process.env.PTERODACTYL_EGG_ID),
    nest: Number(process.env.PTERODACTYL_NEST_ID),
    docker_image: 'ghcr.io/pterodactyl/yolks:nodejs_20',
    startup: startupCommand,
    environment: {
      SESSION_ID: sessionId,
      OWNER_NAME: ownerName,
      OWNER_NUMBER: ownerNum,
    },
    limits: { memory: 512, swap: 0, disk: 1024, io: 500, cpu: 100 },
    feature_limits: { databases: 0, backups: 0 },
    deploy: { locations: [1], dedicated_ip: false, port_range: [] },
  };

  const server = await pteroFetch('/api/application/servers', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return { externalRef: String(server.attributes.identifier) };
}

// Suspends the server on the panel — stops it from running without
// deleting it, so a renewal can unsuspend it again.
async function suspendPanelServer(internalId) {
  assertConfigured();
  await pteroFetch(`/api/application/servers/${internalId}/suspend`, { method: 'POST' });
  return { suspended: true };
}

async function unsuspendPanelServer(internalId) {
  assertConfigured();
  await pteroFetch(`/api/application/servers/${internalId}/unsuspend`, { method: 'POST' });
  return { unsuspended: true };
}

module.exports = { deployToPanel, suspendPanelServer, unsuspendPanelServer };
