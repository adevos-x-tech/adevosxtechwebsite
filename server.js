require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./src/config/db');
const passport = require('./src/config/passport');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');
const { apiLimiter } = require('./src/middleware/rateLimiters');
const { startCronJobs } = require('./src/cron/subscriptionCron');

const publicRoutes = require('./src/routes/public.routes');
const adminRoutes = require('./src/routes/admin.routes');
const authRoutes = require('./src/routes/auth.routes');

const app = express();

// ---------- Core middleware ----------
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '2mb' }));
app.use(passport.initialize());

const allowedOrigins = (process.env.FRONTEND_URLS || '').split(',').map((s) => s.trim()).filter(Boolean);
app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (curl, mobile apps, server-to-server)
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS: ${origin} haijaruhusiwa. Ongeza kwenye FRONTEND_URLS.`));
    },
    credentials: true,
  })
);

app.use('/api', apiLimiter);

// ---------- Health check (useful for Render/uptime monitors) ----------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'adevos-x-backend', time: new Date().toISOString() });
});

// ---------- Serve the frontend (public.html / admin.html) from the same server ----------
// Same-origin means zero CORS headaches during local testing or after deploying
// to Render — the API and the site live on the exact same URL.
const path = require('path');
app.use(express.static(path.join(__dirname, 'frontend')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'frontend', 'public.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'frontend', 'admin.html')));

// ---------- Routes ----------
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);

// ---------- 404 + error handling ----------
app.use(notFound);
app.use(errorHandler);

// ---------- Start ----------
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Adevos-X backend inaendesha kwenye port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });
  if (process.env.NODE_ENV !== 'test') startCronJobs();
});

module.exports = app;
