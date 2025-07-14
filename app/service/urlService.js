const Url = require('../model/urlModel.js');
const logger = getLogger(__filename);
const {generateShortcode} = require('../helper/urlHelper');

const {HOSTNAME, PORT} = process.env;


const shortenUrl = async (url, validity = 30, shortcode) => {
    logger.info('Shortening URL', {url, validity, shortcode});
    const expiry = new Date(Date.now() + validity * 60000);
    const shortcodeToUse = shortcode || generateShortcode();

    const newUrl = new Url({
        originalUrl: {
            protocol: url.protocol,
            hostname: url.hostname,
            pathname: url.pathname || '',
            search: url.search || '',
            hash: url.hash || '',
            href: url.href,
        },
        shortcode: shortcodeToUse,
        expiry,
        clickData: [],
    });

    const savedURL = await newUrl.save();
    return {
        shortLink: `http://${HOSTNAME}:${PORT}/${shortcodeToUse}`,
        expiry: expiry.toISOString(),
    };
};

const getUrlStats = async (shortcode) => {
    logger.info('Retrieving stats for shortcode', {shortcode});
    const url = await Url.findOne({shortcode});
    if (!url || url.expiry < new Date()) {
        throw new Error('Shortcode not found or expired');
    }
    return {
        shortLink: `http://${HOSTNAME}:${PORT}/${shortcode}`,
        expiry: url.expiry.toISOString(),
        clicks: url.clickData.length,
        originalUrl: url.originalUrl,
        clickData: url.clickData,
    };
};

const updateClickData = async (shortcode, source, location) => {
    logger.info('Updating click data', {shortcode, source, location});
    const url = await Url.findOne({shortcode});
    if (!url || url.expiry < new Date()) {
        throw new Error('Shortcode not found or expired');
    }

    url.clickData.push({
        timestamp: new Date(),
        source: source,
        location: location
    });

    await url.save();
    logger.info('Click data updated', {shortcode, clickData: url.clickData});
}

module.exports = {shortenUrl, getUrlStats, updateClickData};