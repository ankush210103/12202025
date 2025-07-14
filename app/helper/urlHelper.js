const logger = getLogger(__filename);

const generateShortcode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let shortcode = '';
    for (let i = 0; i < 6; i++) {
        shortcode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    logger.info('Generated shortcode', { shortcode });
    return shortcode;
};

module.exports = { generateShortcode };