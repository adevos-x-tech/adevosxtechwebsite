# Adevos-X Backend

Backend moja (Node.js + Express + MongoDB) inayoendesha **public.html** na **admin.html** zote mbili. Badala ya `localStorage`, kila mabadiliko kwenye Admin yanahifadhiwa MongoDB na kuonekana papo hapo kwenye Public site.

---

## 1. Mahitaji

- Node.js 18 au zaidi (fetch ya asili inahitajika)
- Akaunti ya **MongoDB Atlas** (free tier 512MB inatosha kuanzia)
- (Baadaye) Akaunti za Google Cloud Console, GitHub Developer, Paystack, Heroku, Pterodactyl Panel, Resend/Gmail

## 2. Kuanzisha Kwenye Kompyuta Yako (Local)

```bash
# 1. Ingiza folder na sakinisha dependencies
cd adevos-x-backend
npm install

# 2. Nakili .env.example kuwa .env
cp .env.example .env

# 3. Fungua .env na weka angalau hii moja ili kuanza:
#    MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/adevosx
#    JWT_SECRET=andika_maneno_marefu_ya_nasibu_hapa

# 4. Tengeneza password ya Admin (itakuuliza uandike password, itatoa hash)
npm run hash-password
# Nakili mstari "ADMIN_PASSWORD_HASH=..." uliopewa, ubandike kwenye .env
# Weka pia ADMIN_USERNAME=admin (au jina lolote unalotaka)

# 5. Jaza database na data za default (sawa na zilizokuwa kwenye admin.html)
npm run seed

# 6. Anzisha server
npm run dev
```

Ukiona `🚀 Adevos-X backend inaendesha kwenye port 5000` — kila kitu kiko sawa.
Jaribu: `http://localhost:5000/api/health` kwenye browser — inapaswa kurudisha `{"status":"ok",...}`.

## 3. Kujaribu Kwa Haraka (bila frontend)

```bash
# Angalia slides zilizo-seed
curl http://localhost:5000/api/public/slides

# Ingia kama Admin (itarudisha token)
curl -X POST http://localhost:5000/api/admin-login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"PASSWORD_ULIYOWEKA"}'

# Tumia token uliyopata kuongeza slide mpya
curl -X POST http://localhost:5000/api/admin/slides \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer WEKA_TOKEN_HAPA" \
  -d '{"img":"https://example.com/pic.jpg","title":"Slide Mpya","cta":"Angalia","action":"support"}'
```

## 4. Frontend (public.html na admin.html) — tayari imeunganishwa

`public.html` na `admin.html` sasa ziko ndani ya folder `frontend/` ya repo hii, na server hii inazihudumia (serve) yenyewe — hakuna localStorage tena, kila kitu kinapita kwenye API halisi.

```bash
npm run dev
# Public site:  http://localhost:5000/
# Admin panel:  http://localhost:5000/admin
```

Kwa sababu zote mbili zinatoka server moja (same-origin), **hakuna tatizo la CORS** hata kidogo wakati wa majaribio ya local.

Ukishaipandisha Render, zitafanya kazi papo hapo kwenye URL moja:
- `https://JINA-LA-APP-LAKO.onrender.com/` → Public site
- `https://JINA-LA-APP-LAKO.onrender.com/admin` → Admin panel

`API_BASE` kwenye HTML zote mbili ni relative (`/api`) kwa default — haihitaji kubadilishwa isipokuwa unataka Admin panel iongee na backend tofauti (kuna field ya "API base URL" kwenye Admin login page kwa hilo).

## 5. Ramani ya Endpoints (muhtasari)

### Public (hakuna login inahitajika)
| Method | Path | Kazi |
|---|---|---|
| GET | `/api/public/slides` | Slider cards |
| GET | `/api/public/services` | Our Services |
| GET | `/api/public/touchcards` | Get In Touch cards |
| GET | `/api/public/updates` | Updates feed |
| GET | `/api/public/testimonials` | Client feedback |
| GET | `/api/public/tutorials` | Tutorials |
| GET | `/api/public/bots` | Bots zote (Deployer catalog) |
| GET | `/api/public/bots/featured` | Bot ya User Account (moja) |
| GET | `/api/public/platforms` | Deployment platforms zilizo active (Heroku, Panel, n.k.) |
| GET | `/api/public/payment-methods` | Mbinu za malipo zilizo active |
| GET | `/api/public/user/:userId/deployments` | Bots za mtumiaji huyu (badala ya localStorage) |
| GET | `/api/public/settings` | Buckets zote (social, links, music, n.k.) kwa mkupuo mmoja |
| GET | `/api/public/settings/:key` | Bucket moja (social/links/music/notifications/pricing/deployer/payments) |
| POST | `/api/public/auth/register` | Usajili + referral bonus |
| GET | `/api/public/user/:id/referral-link` | Pata/tengeneza referral link |
| POST | `/api/public/deploy` | Deploy bot (baada ya malipo) |
| POST | `/api/public/deploy/with-coins` | Deploy kwa AV Coins |
| POST | `/api/public/paystack/initialize` | Anzisha malipo ya Paystack |
| POST | `/api/public/paystack/webhook` | (Paystack pekee inaita hii) |
| POST | `/api/public/payments/manual` | Tuma taarifa ya malipo ya mkono |

### Auth
| Method | Path | Kazi |
|---|---|---|
| POST | `/api/auth/admin-login` | Admin anaingia |
| GET | `/api/auth/google` / `/api/auth/github` | OAuth flow (inahitaji keys) |

### Admin (JWT ya admin inahitajika — `Authorization: Bearer <token>`)
| Method | Path | Kazi |
|---|---|---|
| GET/POST/PUT/DELETE | `/api/admin/slides` | CRUD Slides |
| GET/POST/PUT/DELETE | `/api/admin/services` | CRUD Services |
| GET/POST/PUT/DELETE | `/api/admin/touchcards` | CRUD Touch Cards |
| GET/POST/PUT/DELETE | `/api/admin/updates` | CRUD Updates |
| GET/POST/PUT/DELETE | `/api/admin/feedback` | CRUD Feedback |
| GET/POST/PUT/DELETE | `/api/admin/bots` | CRUD Bots (weka `isFeatured:true` kwa bot ya User Account) |
| GET/POST/PUT/DELETE | `/api/admin/tutorials` | CRUD Tutorials |
| GET/POST/PUT/DELETE | `/api/admin/platforms` | CRUD Deployment Platforms (Heroku, Panel, n.k.) |
| GET/POST/PUT/DELETE | `/api/admin/payment-methods` | CRUD Payment Methods |
| POST | `/api/admin/upload` | Pakia picha (multipart `image`) → Cloudinary URL |
| GET/PUT | `/api/admin/settings/:key` | Badilisha social/links/music/notifications/pricing/deployer/payments |
| GET/POST/PUT/DELETE | `/api/admin/users` | Users management |
| POST | `/api/admin/users/:id/gift-coins` | Toa coins bure kwa user |
| POST | `/api/admin/users/:id/message` | Tuma email kwa user |
| GET/PATCH/DELETE | `/api/admin/deployments` | Deployments monitoring |
| POST | `/api/admin/deployments/:id/extend` | Ongeza siku za ziada bure (gift) |
| GET/DELETE | `/api/admin/activity` | Live Activity feed |
| GET | `/api/admin/payments` | Historia ya malipo yote |
| POST | `/api/admin/payments/:id/verify` | Thibitisha malipo ya mkono |
| POST | `/api/admin/reset` | Rudisha content zote kwenye default |

## 6. Ku-Deploy kwenye Render (kwa majaribio)

1. Tengeneza GitHub repo mpya, push code hii ndani yake
2. Kwenye Render Dashboard → **New +** → **Blueprint** → chagua repo yako (Render itasoma `render.yaml` moja kwa moja)
3. Render itakuuliza ujaze env vars zenye `sync: false` (MONGODB_URI, JWT ni auto-generated, ADMIN_USERNAME, n.k.) — jaza zile unazo, acha nyingine wazi kwa sasa (Heroku/Pterodactyl/Paystack — utaziongeza baadaye)
4. Baada ya deploy kukamilika, fungua Render Shell (au tumia local `.env` yenye `MONGODB_URI` ile ile) na kimbiza:
   ```bash
   npm run seed
   ```
5. Jaribu: `https://JINA-LA-APP-LAKO.onrender.com/api/health`

**Kumbuka (kutokana na tatizo lako la awali la Render):** Backend hii haihifadhi faili au data kwenye disk ya Render — kila kitu kiko MongoDB Atlas (nje) na baadaye Cloudinary (nje) kwa picha. Kwa hiyo "storage" ya Render haitajaa tena. Cha kuangalia sasa ni **saa 750 za instance** kwa mwezi (bure) — zikiisha, huduma inasimama hadi mwezi ujao.

## 7. Ukihamia VPS/Panel Baadaye

Backend hii ni Node.js ya kawaida — inaweza kuendeshwa kwa `pm2` au Docker kwenye VPS yoyote bila mabadiliko ya code, mradi tu `.env` ile ile iko sawa. Nitakusaidia kuandaa `Dockerfile` na maelekezo ya PM2 wakati huo utakapofika.

## 8. Maboresho Mapya (Subscription, Dynamic Platforms/Payments, Uploads, Usalama)

### A. Auto-Expiry, Renewal & Reminders (Meza 1 & 2)
- Kila deployment ina `expiresAt` (default siku 30, inadhibitiwa na `Setting.subscription.defaultSubscriptionDays`)
- **Cron ya kila siku saa 02:00** — inakagua deployments zilizopita `expiresAt`, inaita `stopHerokuApp` / `suspendPanelServer`, na kuweka `status:'expired'`
- **Cron ya kila siku saa 09:00** — inatuma email ya reminder (`Setting.subscription.reminderDaysBefore`, default siku 3) kabla ya expiry, mara moja tu (`reminderSentAt`)
- **Discounted Pre-Renewal** — ukilipia upya ndani ya `discountValidDaysBefore` siku kabla ya expiry, bei inapungua kwa `renewalDiscountPercent` (automatic, kwenye `computeAmount()`)
- **Admin Manual Extend** — `POST /api/admin/deployments/:id/extend { days }` — ongeza siku bila malipo (gift)
- **Auto-Renewal** — malipo ya `deployment_renewal` yakithibitishwa (Paystack au Manual verify), `renewDeployment()` inaongeza expiry moja kwa moja
- Badilisha thamani hizi zote (discount %, siku za bonus, siku za reminder) kwenye `PUT /api/admin/settings/subscription` — hakuna code inayoguswa

### B. Dynamic Deployment Platforms (Meza 3)
- Collection mpya `Platform` — `slug, name, description, icon, isActive, position`
- Admin: `GET/POST/PUT/DELETE /api/admin/platforms` — ongeza, futa, badilisha mpangilio (`position`), zima (`isActive:false`)
- Public: `GET /api/public/platforms` — inarudisha zilizo `isActive:true` tu, kwa mpangilio wa `position`
- **Kuongeza platform mpya halisi** (mfano Railway) bado kunahitaji hatua moja ya code (mara moja tu): andika `src/services/railwayService.js`, kisha ongeza mstari mmoja kwenye `src/utils/dynamicDeploy.js` (`REGISTRY.railway = deployToRailway`). Baada ya hapo, Admin anaweza kuizima/kuiwasha/kuipanga bila kugusa code tena
- API keys za kila platform zinabaki `.env` pekee — Admin hawezi kuziona kamwe

### C. Dynamic Payment Methods (Meza 4)
- Collection mpya `PaymentMethod` — inachukua nafasi ya orodha ya zamani ya `payments` — sasa ina `type: online | manual | coins`, `instructions`, `isActive`, `position`
- Admin: `GET/POST/PUT/DELETE /api/admin/payment-methods`
- Public: `GET /api/public/payment-methods` — zilizo active tu, kwa mpangilio
- Kufuta/kuzima/kubadilisha maandishi ya M-Pesa/Tigo Pesa — **hakuna code**
- Kuongeza gateway mpya halisi (mfano Flutterwave) — hatua moja ya code (service + route), kisha metadata yake yote (jina, maelezo, on/off) inadhibitiwa na Admin bila code

### D. Image Upload Halisi (Meza 5)
- `POST /api/admin/upload` (multipart/form-data, field `image`) — inapokea faili, inapakia Cloudinary, inarudisha `{ url, publicId }`
- Admin panel sasa inaweza kutumia `<input type="file">` badala ya kubandika URL ya picha kila wakati
- Fields za `layout` (TouchCard) na `imagePosition` (Slide) zinaruhusu Admin kudhibiti mpangilio wa picha/maandishi bila CSS ya moja kwa moja

### E. Usalama (Meza 6)
| Kipaumbele | Kilichofanyika |
|---|---|
| High | `deployLimiter` — max maombi 10/saa kwa `/api/deploy` na `/api/deploy/with-coins` |
| High | Admin login ina bcrypt (tayari) + **2FA ya hiari (TOTP)** — weka `ADMIN_2FA_SECRET` (`npm run generate-2fa`) kuiwasha |
| Medium | `express-validator` kwenye routes nyeti zaidi: admin-login, register, deploy, create user, gift-coins, message user |
| Medium | Hatukutumia `heroku-client` kamwe — tulitumia `fetch` ya asili ya Node moja kwa moja (tayari sahihi) |
| Low | Redis caching ya slides/services — **bado haijafanyika, ni Phase 2** kama ilivyoainishwa (kipaumbele cha chini) |
| Low | `userDeployedBot`/`deployedBots` kutoka localStorage kwenda MongoDB — **IMEKAMILIKA** kupitia `Deployment` model + `GET /api/public/user/:userId/deployments` |

### Kuwasha 2FA kwa Admin (hiari)
```bash
npm run generate-2fa
# Nakili ADMIN_2FA_SECRET kwenye .env, na uweke otpauth URL kwenye Google Authenticator/Authy
```
Ukishaweka `ADMIN_2FA_SECRET`, `POST /api/auth/admin-login` itahitaji field ya ziada `otp` (namba 6 kutoka kwenye app yako ya authenticator).

## 9. Muundo wa Folder

```
adevos-x-backend/
├── server.js                 # Entry point (pia inahudumia frontend/)
├── render.yaml                # Render blueprint
├── .env.example
├── frontend/
│   ├── public.html            # Public website
│   └── admin.html              # Admin control center
├── src/
│   ├── config/                # db.js, passport.js, cloudinary.js
│   ├── middleware/             # auth.js, errorHandler.js, rateLimiters.js, upload.js, validate.js
│   ├── models/                 # Mongoose schemas (Slide, Bot, User, Platform, n.k.)
│   ├── controllers/            # Business logic
│   ├── routes/                 # public.routes.js, admin.routes.js, auth.routes.js
│   ├── services/               # herokuService.js, pterodactylService.js
│   ├── cron/                   # subscriptionCron.js (auto-expiry + reminders)
│   ├── utils/                  # jwt, email, referral, asyncHandler, dynamicDeploy
│   └── seed/                   # defaults.js + seed.js
```

## 10. Hatua Zinazofuata

- [ ] Weka `MONGODB_URI` yako halisi na kimbiza `npm run seed`
- [ ] Tengeneza `ADMIN_PASSWORD_HASH` na jaribu `/api/auth/admin-login`
- [ ] (Hiari) Wezesha 2FA: `npm run generate-2fa`
- [ ] (Hiari) Weka Cloudinary keys ili `/api/admin/upload` ifanye kazi
- [ ] Deploy kwenye Render kwa kutumia `render.yaml`
- [ ] Nitakusaidia kuunganisha `admin.html` na `public.html` kwenye API hii (kuondoa localStorage kabisa)
- [ ] Ukishapata Google/GitHub OAuth keys, Paystack keys, Heroku/Pterodactyl keys — ziongeze kwenye `.env` (au Render dashboard), hakuna mabadiliko ya code yanayohitajika
