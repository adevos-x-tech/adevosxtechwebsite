const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const upload = require('../middleware/upload');
const { createUserRules, giftCoinsRules, messageUserRules } = require('../validators/rules');

const createCrudController = require('../controllers/crudFactory');
const Slide = require('../models/Slide');
const Service = require('../models/Service');
const TouchCard = require('../models/TouchCard');
const Update = require('../models/Update');
const Feedback = require('../models/Feedback');
const Bot = require('../models/Bot');
const Tutorial = require('../models/Tutorial');

const { getSetting, updateSetting, getAllSettings } = require('../controllers/settingsController');
const {
  getAllUsers,
  createUser,
  updateUser,
  giftCoins,
  deleteUser,
  messageUser,
} = require('../controllers/usersController');
const {
  getAllDeployments,
  updateDeploymentStatus,
  deleteDeployment,
  extendSubscription,
} = require('../controllers/deploymentsController');
const { getActivity, clearActivity } = require('../controllers/activityController');
const { getAllTransactions, verifyManualPayment } = require('../controllers/paymentsController');
const { resetAllContent } = require('../controllers/resetController');
const { uploadImage } = require('../controllers/uploadController');
const {
  getAllPlatforms,
  createPlatform,
  updatePlatform,
  deletePlatform,
} = require('../controllers/platformsController');
const {
  getAllPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
} = require('../controllers/paymentMethodsController');

// Every route below this line requires a valid admin JWT.
router.use(requireAdmin);

// ---------- Generic CRUD helper: mounts /:resource with getAll/create/update/remove ----------
function mountCrud(path, Model, options) {
  const c = createCrudController(Model, options);
  router.get(path, c.getAll);
  router.get(`${path}/:id`, c.getOne);
  router.post(path, c.create);
  router.put(`${path}/:id`, c.update);
  router.delete(`${path}/:id`, c.remove);
}

mountCrud('/slides', Slide, { sortBy: { order: 1 } });
mountCrud('/services', Service, { sortBy: { order: 1 } });
mountCrud('/touchcards', TouchCard, { sortBy: { order: 1 } });
mountCrud('/updates', Update, { sortBy: { createdAt: -1 } });
mountCrud('/feedback', Feedback, { sortBy: { createdAt: -1 } });
mountCrud('/bots', Bot, { sortBy: { createdAt: 1 } });
mountCrud('/tutorials', Tutorial, { sortBy: { createdAt: 1 } });

// ---------- Dynamic Platforms (Table 3) ----------
router.get('/platforms', getAllPlatforms);
router.post('/platforms', createPlatform);
router.put('/platforms/:id', updatePlatform);
router.delete('/platforms/:id', deletePlatform);

// ---------- Dynamic Payment Methods (Table 4) ----------
router.get('/payment-methods', getAllPaymentMethods);
router.post('/payment-methods', createPaymentMethod);
router.put('/payment-methods/:id', updatePaymentMethod);
router.delete('/payment-methods/:id', deletePaymentMethod);

// ---------- Image Upload (Table 5) ----------
router.post('/upload', upload.single('image'), uploadImage);

// ---------- Settings buckets (Sectors 11, 17, 18, 19) ----------
router.get('/settings', getAllSettings);
router.get('/settings/:key', getSetting);
router.put('/settings/:key', updateSetting);

// ---------- Users management (Sector 22) ----------
router.get('/users', getAllUsers);
router.post('/users', createUserRules, handleValidation, createUser);
router.put('/users/:id', updateUser);
router.post('/users/:id/gift-coins', giftCoinsRules, handleValidation, giftCoins);
router.post('/users/:id/message', messageUserRules, handleValidation, messageUser); // Sector 23
router.delete('/users/:id', deleteUser);

// ---------- Deployments monitoring + subscription control (Sector 21, Tables 1 & 2) ----------
router.get('/deployments', getAllDeployments);
router.patch('/deployments/:id/status', updateDeploymentStatus);
router.post('/deployments/:id/extend', extendSubscription);
router.delete('/deployments/:id', deleteDeployment);

// ---------- Live Activity (Sector 20) ----------
router.get('/activity', getActivity);
router.delete('/activity', clearActivity);

// ---------- Payments (Sector 14, 15) ----------
router.get('/payments', getAllTransactions);
router.post('/payments/:id/verify', verifyManualPayment);

// ---------- System Reset (Sector 25) ----------
router.post('/reset', resetAllContent);

module.exports = router;
