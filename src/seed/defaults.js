// Mirrors the DEFAULTS object inside admin.html so the backend and the
// original localStorage-based demo start from identical content.

const LISTS = {
  slides: [
    { img: 'https://files.catbox.moe/ymmyxd.jpg', title: '24/7 Community Support', cta: 'Join Now', actionType: 'internal', action: 'support', url: '', order: 0 },
    { img: 'https://files.catbox.moe/piggs4.png', title: 'Watch Step-by-Step Tutorials', cta: 'Explore Tutorials', actionType: 'internal', action: 'tutorials', url: '', order: 1 },
    { img: 'https://files.catbox.moe/k5xhot.png', title: 'Deploy with AV Coins', cta: 'Learn More', actionType: 'internal', action: 'coins', url: '', order: 2 },
    { img: 'https://files.catbox.moe/1xssrz.png', title: 'Unlimited Deployment, with Deployer Account', cta: 'Create Account', actionType: 'internal', action: 'deployer', url: '', order: 3 },
  ],
  services: [
    { icon: 'fas fa-code', title: 'Web Development', desc: 'Custom websites and web apps built with modern stacks, optimized for speed and scale.', order: 0 },
    { icon: 'fab fa-whatsapp', title: 'WhatsApp Bots', desc: 'Powerful automated bots for business, customer service, and entertainment.', order: 1 },
    { icon: 'fas fa-rocket', title: 'Bot Deployment', desc: 'Seamless hosting and deployment for your bots with 99% uptime guaranteed.', order: 2 },
    { icon: 'fas fa-brain', title: 'AI Solutions', desc: 'Custom AI integrations and solutions to power your next-generation applications.', order: 3 },
    { icon: 'fab fa-telegram-plane', title: 'Telegram bots', desc: 'High-speed Telegram integrations for community management and utilities.', order: 4 },
    { icon: 'fas fa-shield-alt', title: 'Cyber Security', desc: 'Protect your digital assets with enterprise-grade security consulting.', order: 5 },
  ],
  touchcards: [
    { key: 'deploy', title: 'Deploy bot', desc: 'Launch your customized bot instances in less than 2 minutes smoothly.', img: 'https://files.catbox.moe/0jcrgh.jpg', btn: 'Deploy Now', actionType: 'internal', action: 'deployModal', url: '', order: 0 },
    { key: 'deployeracc', title: 'Create Deployer account', desc: 'Unlock premium micro-servers and cloud instances tailored to your dashboard.', img: 'https://files.catbox.moe/e7mla3.jpg', btn: 'Create Account', actionType: 'internal', action: 'deployerModal', url: '', order: 1 },
    { key: 'manage', title: 'Manage your bot', desc: 'Scale resources, check processes logs, and manage live API states.', img: 'https://files.catbox.moe/3t7zau.jpg', btn: 'Manage Now', actionType: 'internal', action: 'manageModal', url: '', order: 2 },
    { key: 'tutorials', title: 'Watch tutorials', desc: 'Access our comprehensive step-by-step video tutorials specialized for clear setups and deployment guidance.', img: 'https://files.catbox.moe/piggs4.png', btn: 'Watch Now', actionType: 'internal', action: 'tutorialsModal', url: '', order: 3 },
    { key: 'feedback', title: 'Send Your Feedback', desc: 'Your insights drive our development. Feedback means a direct bridge to our core ecosystem optimizations.', img: 'https://files.catbox.moe/szg57z.jpg', btn: 'Send Now', actionType: 'internal', action: 'feedbackForm', url: '', order: 4 },
    { key: 'support', title: 'Get support', desc: 'We have dedicated WhatsApp and Telegram groups and channels specifically designed to provide support.', img: 'https://files.catbox.moe/tfeilw.jpg', btn: 'Join Now', actionType: 'internal', action: 'supportDropdown', url: '', order: 5 },
    { key: 'developer', title: 'Meet a Developer', desc: 'Meet Ahmed, our Lead Full-Stack Engineer & AI Systems Architect. Get direct custom sessions.', img: 'https://files.catbox.moe/mujnit.jpg', btn: 'Contact', actionType: 'external', action: '', url: 'https://wa.me/255XXXXXXXXX?text=Hi%20Ahmed', order: 6 },
    { key: 'updates', title: 'Updates', desc: 'Live system logs and announcements.', img: 'https://files.catbox.moe/2x1der.jpg', btn: '', actionType: 'internal', action: 'updatesCard', url: '', order: 7 },
  ],
  updates: [
    { time: 'Just Now', text: 'New bot attasa added to the list of deployer bot' },
    { time: '2 Hours Ago', text: 'Pterodactyl Panel core systems updated smoothly to version v2.4' },
    { time: '5 Hours Ago', text: 'Optimized Node.js memory profile configurations on 4GB RAM micro-instances' },
    { time: '1 Day Ago', text: 'Cloudflare dynamic subdomains pair automation verified and secured' },
  ],
  feedback: [
    { text: 'Adevos-X transformed our business with their WhatsApp bot. Engagement skyrocketed!', author: 'Sarah J., CEO' },
    { text: 'The web development team delivered a blazing fast site. Highly recommended.', author: 'Michael T., Founder' },
    { text: 'Their AI solutions saved us thousands of hours. Truly futuristic tech.', author: 'Elena R., CTO' },
  ],
  bots: [
    { name: 'ADEVOS-X BOT', desc: 'The official Adevos-X flagship bot. AI, media, sticker maker, group management and more.', img: 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg', github: 'https://github.com/adevos', author: 'Ahmed K.', addedDate: 'May 20, 2026', isFeatured: true },
    { name: 'ATTASA BOT', desc: 'Multi-feature WhatsApp bot with AI, media downloader, and game modules.', img: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg', github: 'https://github.com', author: 'Juma Petro', addedDate: 'June 2, 2026', isFeatured: false },
    { name: 'CYBER BOT', desc: 'Security-focused bot for network scans, IP lookups, and threat alerts.', img: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg', github: 'https://github.com', author: 'Nia Security Team', addedDate: 'June 10, 2026', isFeatured: false },
    { name: 'MEDIA BOT', desc: 'Advanced media downloader supporting YouTube, TikTok, Instagram and more.', img: 'https://images.pexels.com/photos/3183158/pexels-photo-3183158.jpeg', github: 'https://github.com', author: 'Leo Mrema', addedDate: 'June 15, 2026', isFeatured: false },
    { name: 'AI BOT', desc: 'Powered by latest AI models for conversations, code help, and image generation.', img: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg', github: 'https://github.com', author: 'Adevos-X AI Team', addedDate: 'June 28, 2026', isFeatured: false },
  ],
  tutorials: [
    { tutorialId: 'whatsapp', title: 'How to deploy WhatsApp Bot', desc: 'Step-by-step guide to get your WhatsApp bot live.', icon: 'fab fa-whatsapp', video: '' },
    { tutorialId: 'telegram', title: 'How to get Telegram bot', desc: 'Setup and deploy your Telegram bot easily.', icon: 'fab fa-telegram-plane', video: '' },
    { tutorialId: 'deployer', title: 'How to create Deployer account', desc: 'Unlock premium features with a Deployer account.', icon: 'fas fa-key', video: '' },
    { tutorialId: 'freebot', title: 'How to get a free bot', desc: 'Learn how to claim your free bot today.', icon: 'fas fa-gift', video: '' },
  ],
  platforms: [
    { slug: 'heroku', name: 'Heroku', description: 'Deploy kwenye Heroku dyno.', envKeyHint: 'HEROKU_API_KEY', icon: 'fas fa-cloud', isActive: true, position: 0 },
    { slug: 'panel', name: 'Pterodactyl Panel', description: 'Deploy kwenye VPS panel yako.', envKeyHint: 'PTERODACTYL_API_KEY', icon: 'fas fa-server', isActive: true, position: 1 },
  ],
  paymentMethods: [
    { slug: 'paystack', name: 'Paystack', type: 'online', instructions: '', icon: 'fas fa-credit-card', isActive: true, position: 0 },
    { slug: 'mpesa-ahmed', name: 'Ahmed — M-Pesa / Airtel', type: 'manual', instructions: '+255 XXX XXX XXX — tuma screenshot WhatsApp baada ya kulipa.', icon: 'fas fa-mobile-alt', isActive: true, position: 1 },
    { slug: 'tigopesa-official', name: 'Adevos-X Official — Tigo Pesa', type: 'manual', instructions: '+255 YYY YYY YYY — tuma screenshot WhatsApp baada ya kulipa.', icon: 'fas fa-mobile-alt', isActive: true, position: 2 },
    { slug: 'av-coins', name: 'AV Coins', type: 'coins', instructions: '', icon: 'fas fa-coins', isActive: true, position: 3 },
  ],
};

const SETTINGS = {
  social: [
    { key: 'twitter', icon: 'fab fa-twitter', url: '#' },
    { key: 'whatsapp', icon: 'fab fa-whatsapp', url: '#' },
    { key: 'youtube', icon: 'fab fa-youtube', url: '#' },
    { key: 'facebook', icon: 'fab fa-facebook-f', url: '#' },
    { key: 'instagram', icon: 'fab fa-instagram', url: '#' },
    { key: 'telegram', icon: 'fab fa-telegram-plane', url: '#' },
    { key: 'tiktok', icon: 'fab fa-tiktok', url: '#' },
  ],
  links: {
    freeBot: 'https://wa.me/255XXXXXXXXX?text=I+need+a+free+bot',
    devContact: 'https://wa.me/255XXXXXXXXX?text=Hi%20Ahmed',
    waCommunity: '#',
    waChannel: '#',
    tgChannel: '#',
    pairFallback: 'https://adevosx.site/pair',
    assistantGreet: "Hello, I'm Adevos assistant. How can I help you?",
    assistantReply: 'Hi! Let me know if you need any technical support.',
  },
  music: {
    autoplay: false,
    volume: 70,
    tracks: [
      { name: 'Cyber Pulse — Adevos Mix', url: '' },
      { name: 'Green Neon — Lo-Fi Deploy', url: '' },
      { name: 'Terminal Beats — Code Flow', url: '' },
    ],
  },
  notifications: { enabled: true, intervalSeconds: 6.5, durationSeconds: 4, stopAfterMinutes: 4 },
  pricing: { deployPrice: 5, coinsPerReferral: 2, coinsPerDeploy: 50 },
  deployer: {
    price: 10,
    days: 30,
    benefits:
      'Deploy unlimited bots\nAccess to all bot templates\nPriority support & uptime guarantee\nCustom subdomain for your bot panel\nExclusive Deployer dashboard access',
  },
  subscription: {
    renewalDiscountPercent: 15, // % off if renewed before expiry (Table 1)
    discountValidDaysBefore: 3, // discount only applies if renewing within this many days of expiry
    bonusDaysOnRenewal: 0, // optional free extra days admin can grant on every renewal
    reminderDaysBefore: 3, // Sector: "Cron job inatuma email siku 3 kabla ya expiry"
    defaultSubscriptionDays: 30, // how long a fresh deployment lasts before it needs renewal
  },
};

module.exports = { DEFAULTS: { lists: LISTS, settings: SETTINGS } };
