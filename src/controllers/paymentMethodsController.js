const PaymentMethod = require('../models/PaymentMethod');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/public/payment-methods
const getActivePaymentMethods = asyncHandler(async (req, res) => {
  const methods = await PaymentMethod.find({ isActive: true }).sort({ position: 1 });
  res.json(methods);
});

// GET /api/admin/payment-methods
const getAllPaymentMethods = asyncHandler(async (req, res) => {
  const methods = await PaymentMethod.find().sort({ position: 1 });
  res.json(methods);
});

const createPaymentMethod = asyncHandler(async (req, res) => {
  const method = await PaymentMethod.create(req.body);
  res.status(201).json(method);
});

const updatePaymentMethod = asyncHandler(async (req, res) => {
  const method = await PaymentMethod.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!method) return res.status(404).json({ error: 'Mbinu ya malipo haipo.' });
  res.json(method);
});

const deletePaymentMethod = asyncHandler(async (req, res) => {
  const method = await PaymentMethod.findByIdAndDelete(req.params.id);
  if (!method) return res.status(404).json({ error: 'Mbinu ya malipo haipo.' });
  res.json({ success: true, id: req.params.id });
});

module.exports = {
  getActivePaymentMethods,
  getAllPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
};
