require('dotenv').config({silent: true});

const express = require('express');


const LoggingMiddleware = require('./config/middlewares/loggerM')

const app = express();
require('./config/logger')(app);
app.use(express.json());

(async () => {

    await require('./config/db').connect(app);

    const urlRoutes = require('./app/controller/urlController');
    app.use('/', urlRoutes);
    const {errorHandler} = require('./config/middlewares/errorHandler');
    app.use(errorHandler);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
    });
})()