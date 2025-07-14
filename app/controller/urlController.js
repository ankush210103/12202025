const express = require('express');
const router = express.Router();
const {shortenUrl, getUrlStats, updateClickData} = require('../service/urlService');
const Joi = require('joi');

const shortenUrlSchema = Joi.object({
    url: Joi.string().uri().required(),
    validity: Joi.number().integer().min(1).optional().default(30),
    shortcode: Joi.string().alphanum().min(4).max(10).optional()
});

const shortenUrlValidation = (req, res, next) => {
    const {error, value} = shortenUrlSchema.validate(req.body);
    if (error) return res.status(400).json({error: error.details[0].message});
    req.body = JSON.parse(JSON.stringify(value));
    next();
};


router.post('/shorturls', shortenUrlValidation, async (req, res) => {
    try {
        let {url, validity, shortcode} = req.body;
        try {
            url = new URL(url);
        } catch (e) {
            logger.error(e);
            return res.status(400).json({error: 'Invalid URL'});
        }
        const result = await shortenUrl(url, validity, shortcode);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
});

router.get('/shorturls/:shortcode', async (req, res) => {
    try {
        const stats = await getUrlStats(req.params.shortcode);
        res.status(200).json(stats);
    } catch (error) {
        res.status(404).json({error: error.message});
    }
});


router.get('/:shortcode', async (req, res) => {
    try {
        const stats = await getUrlStats(req.params.shortcode);
        logger.info(stats);
        await updateClickData(req.params.shortcode, req.get('Referer') || 'Unknown', req.ip);
        res.redirect(stats.originalUrl.href);
    } catch (error) {
        res.status(404).json({error: error.message});
    }
});

module.exports = router;