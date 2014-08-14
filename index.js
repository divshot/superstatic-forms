var _ = require('lodash');
var nodemailer = require('nodemailer');
var interpolate = require('interpolate');
var bodyParser = require('body-parser');
var isXhr = require('is-xhr');
var response = require('./lib/response');

var forms = module.exports = function (settings) {
  settings = settings || {};
  
  var transport = nodemailer.createTransport(settings.transport, settings.options || {});
  
  return function (req, res, next) {
    var taskName = req.service.path.replace('/forms/', '').split('/')[0];
    var taskConfig = req.service.config[taskName];
    
    if (req.method !== 'POST') return next();
    if (!taskName || !taskConfig) return next();
    
    bodyParser.json()(req, res, function (err) {
      var rawMailOptions = _.extendAndOmit(settings, taskConfig, ['transport', 'options']);
      var mailOptions = parseOptionsTemplate(rawMailOptions, req.body);
      
      if (!mailOptions.to) return response.missingRecipient(res, taskConfig, isXhr(req));
      if (_.isEmpty(settings)) return response.defaultResponse(req, res, mailOptions);
      
      transport.sendMail(mailOptions, response.emailSent(req, res, taskConfig));
    });
  };
};

function parseOptionsTemplate (opts, data) {
  return _(opts)
    .map(function (str, key) {
      return [key, interpolate(str, data, { delimiter: '{{}}' })];
    })
    .zipObject()
    .value();
}

_.mixin({
  'extendAndOmit': function (toExtend, extendWith, valuesToOmit) {
    return _(toExtend)
      .omit(valuesToOmit)
      .extend(extendWith)
      .value();
  }
});