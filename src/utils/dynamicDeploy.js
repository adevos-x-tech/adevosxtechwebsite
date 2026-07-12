const Platform = require('../models/Platform');
const { deployToHeroku } = require('../services/herokuService');
const { deployToPanel } = require('../services/pterodactylService');

// ==========================================================================
// HOW TO ADD A NEW DEPLOYMENT PLATFORM (e.g. Railway):
//   1) Write src/services/railwayService.js exporting an async function
//      that takes the same shape of arguments as the ones below and
//      returns { externalRef }.
//   2) Import it here and add ONE line to the REGISTRY object:
//         railway: deployToRailway,
//   3) In the Admin panel, add a Platform with slug:"railway" — it will
//      show up in the public deploy modal automatically, no other code
//      changes needed. Deactivating/reordering/renaming platforms never
//      requires touching this file again.
// ==========================================================================
const REGISTRY = {
  heroku: deployToHeroku,
  panel: deployToPanel,
};

async function runDeploy(slug, payload) {
  const platform = await Platform.findOne({ slug, isActive: true });
  if (!platform) {
    const err = new Error(`Platform "${slug}" haipo au imezimwa (isActive:false).`);
    err.statusCode = 400;
    throw err;
  }

  const serviceFn = REGISTRY[slug];
  if (!serviceFn) {
    const err = new Error(
      `Platform "${slug}" ipo kwenye DB lakini haina service module iliyounganishwa kwenye dynamicDeploy.js bado.`
    );
    err.statusCode = 501;
    throw err;
  }

  return serviceFn(payload);
}

module.exports = { runDeploy, REGISTRY };
