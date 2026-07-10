function notFound(req, res, next) {
  res.status(404).json({ error: `Route haipo: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('🔥', err.message);
  const status = err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Kuna hitilafu ndani ya server.',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

module.exports = { notFound, errorHandler };
