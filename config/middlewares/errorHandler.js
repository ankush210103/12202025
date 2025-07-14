const logger = getLogger(__filename);

const errorHandler = (err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
};

module.exports = { errorHandler };