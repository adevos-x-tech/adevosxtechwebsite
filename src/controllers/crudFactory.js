const asyncHandler = require('../utils/asyncHandler');

// Builds { getAll, getOne, create, update, remove } handlers for any
// Mongoose model. Used for every content type that's just a plain
// add/edit/delete list (Slides, Services, TouchCards, Updates,
// Feedback, Bots, Tutorials) so we don't repeat the same five
// functions seven times over.
function createCrudController(Model, options = {}) {
  const { sortBy = { order: 1, createdAt: 1 }, afterChange } = options;

  const getAll = asyncHandler(async (req, res) => {
    const items = await Model.find().sort(sortBy);
    res.json(items);
  });

  const getOne = asyncHandler(async (req, res) => {
    const item = await Model.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Haipo.' });
    res.json(item);
  });

  const create = asyncHandler(async (req, res) => {
    const item = await Model.create(req.body);
    if (afterChange) await afterChange('create', item, req);
    res.status(201).json(item);
  });

  const update = asyncHandler(async (req, res) => {
    const item = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ error: 'Haipo.' });
    if (afterChange) await afterChange('update', item, req);
    res.json(item);
  });

  const remove = asyncHandler(async (req, res) => {
    const item = await Model.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Haipo.' });
    if (afterChange) await afterChange('delete', item, req);
    res.json({ success: true, id: req.params.id });
  });

  return { getAll, getOne, create, update, remove };
}

module.exports = createCrudController;
