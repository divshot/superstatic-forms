var _ = require('lodash');
var nodemailer = require('nodemailer');
var MailParser = require("mailparser").MailParser;
var interpolate = require('interpolate');
var bodyParser = require('body-parser');

var mailDefaults = {
  transport: 'SMTP'
};

var forms = module.exports = function (settings) {
  settings = settings || {};
  
  var transportName = _.defaults(settings, mailDefaults).transport;
  var transport = nodemailer.createTransport(transportName, settings.options);
  
  return function (req, res, next) {
    var taskName = req.service.path.replace('/forms/', '').split('/')[0];
    var taskConfig = req.service.config[taskName];
    
    if (req.method !== 'POST') return next();
    if (!taskName || !taskConfig) return next();
    
    bodyParser()(req, res, function (err) {
      var rawMailOptions = _.extendAndOmit(settings, taskConfig, ['transport', 'options']);
      var mailOptions = parseOptionsTemplate(rawMailOptions, req.body);
      
      if (!mailOptions.to) return respondWithMissingRecipient(res, taskConfig, isXhr(req));
      
      transport.sendMail(mailOptions, respondWhenEmailSent(req, res, taskConfig));
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

function respondWithMissingRecipient (res, config, xhr) {
  if (xhr) {
    res.writeHead(400);
    res.end(forms.errorMessages.MISSING_RECIPIENT);
  }
  else {
    res.writeHead(302, {
      'Location': config.error
    });
    res.end();
  }
}

function isXhr (req) {
  return (req.headers["x-requested-with"] === 'XMLHttpRequest');
}

function respondWhenEmailSent (req, res, taskConfig) {
  return function (err, emailResponse) {
    if (isXhr(req)) {
      parseMailHeaders((emailResponse) ? emailResponse.message : {}, function (emailObject) {
        res.writeHead(err ? 500 : 200);
        res.end(err ? err.message : JSON.stringify(emailObject));
      });
    }
    else {
      res.writeHead(302, {
        'Location': (err) ? taskConfig.error : taskConfig.success
      });
      res.end();
    }
  };
}

function parseMailHeaders (headers, callback) {
  var mailparser = new MailParser();
  
  mailparser.once('end', callback);
  mailparser.write(headers);
  mailparser.end();
}

_.mixin({
  'extendAndOmit': function (toExtend, extendWith, valuesToOmit) {
    return _(toExtend)
      .omit(valuesToOmit)
      .extend(extendWith)
      .value();
  }
});

forms.errorMessages = {
  MISSING_RECIPIENT: 'Missing email recipient value'
};