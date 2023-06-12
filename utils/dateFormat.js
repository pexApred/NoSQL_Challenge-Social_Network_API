const { DateTime } = require('luxon');

const dateFormat = DateTime.now().toFormat("yyyy-LL-dd");

module.exports = dateFormat;