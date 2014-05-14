var nodemailer = require('nodemailer');

module.exports = function (options) {
  return function (req, res, next) {
    if (req.method !== 'POST') return next();
    
    var taskName = parseTaskName(req.service.path);
    
    if (!taskName || !req.service.config[taskName]) return next();
    
    
  };
};

function parseTaskName (pathname) {
  return pathname.replace('/forms/', '').split('/')[0];
}