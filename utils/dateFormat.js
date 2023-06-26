const { DateTime } = require('luxon');

const dateFormat = DateTime.now().toFormat("LL-dd-yyyy");

module.exports = dateFormat;