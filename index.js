var nodemailer = require('nodemailer');
var _ = require('lodash');
var mailDefaults = {
  transport: 'SMTP'
};

module.exports = function (settings) {
  var transportName = _.defaults(settings, mailDefaults).transport;
  var transport = nodemailer.createTransport(transportName, settings.options);
  
  return function (req, res, next) {
    if (req.method !== 'POST') return next();
    
    var taskName = req.service.path.replace('/forms/', '').split('/')[0];
    var taskConfig = req.service.config[taskName];
    
    if (!taskName || !taskConfig) return next();
    
    var mailOptions = _(settings)
      .omit(['transport', 'options'])
      .extend(taskConfig)
      .value();
    
    // send mail with defined transport object
    transport.sendMail(mailOptions, function (err, sendResponse){
      if (isXhr(req)) {
        res.writeHead(err ? 400 : 200);
        res.end(err ? err.message :  parseHeaders(sendResponse.message));
      }
      else {
        res.writeHead(302, {
          'Location': (err) ? taskConfig.success : taskConfig.error
        });
        res.end();
      }      
    });
  };
};

function isXhr (req) {
  return (req.headers["x-requested-with"] === 'XMLHttpRequest');
}

function parseHeaders (str) {
  var headers = _(str.split('\r'))
    .map(function (data) {
      return data.replace('\n', '');
    })
    .filter(_.identity)
    .map(function (data) {
      var obj = {};
      data = data.split(': ');
      
      obj[data[0]] = data[1];
      
      return obj;
    })
    .reduce(function (obj, data) {
      var key = Object.keys(data)[0];
      var val = data[key];
      
      // Body of email
      if (!val) {
        val = key;
        key = 'body';
      }
      
      obj[key] = val;
      
      return obj;
    }, {});
    
  return JSON.stringify(headers);
}