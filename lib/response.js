var _ = require('lodash');
var isXhr = require('is-xhr');
var errors = require('./errors');
var MailParser = require("mailparser").MailParser;

module.exports = {
  missingSender: function (res, config, xhr) {
    if (xhr) {
      res.writeHead(400);
      res.end(errors.MISSING_SENDER);
    }
    else {
      // TODO: test this
      if (!config.error) return res.end(errors.DEFAULT_ERROR_PAGE);

      res.writeHead(302, {
        'Location': config.error
      });
      res.end();
    }
  },

  missingRecipient: function (res, config, xhr) {
    if (xhr) {
      res.writeHead(400);
      res.end(errors.MISSING_RECIPIENT);
    }
    else {
      // TODO: test this
      if (!config.error) return res.end(errors.DEFAULT_ERROR_PAGE);

      res.writeHead(302, {
        'Location': config.error
      });
      res.end();
    }
  },

  defaultResponse: function (req, res, mailOptions) {
    var response = _.extend({headers: req.headers}, mailOptions, {sent: false});

    res.writeHead(200, {
      'Content-Type': 'application/json'
    });
    res.end(JSON.stringify(response));
  },

  emailSent: function (req, res, taskConfig) {
    return function (err, emailResponse) {

      if (isXhr(req)) {
        parseMailHeaders((emailResponse || {}).message, function (emailObject) {
          res.writeHead(err ? 500 : 200);
          res.end(err ? err.message : JSON.stringify(emailObject));
        });
      }
      else {
        if (!err && !taskConfig.success) return res.end('Form Sent');

        res.writeHead(302, {
          'Location': (err) ? taskConfig.error : taskConfig.success
        });
        res.end();
      }
    };
  }
};

function parseMailHeaders (headers, callback) {
  var mailparser = new MailParser();
  mailparser.once('end', callback);
  mailparser.write(headers);
  mailparser.end();
}