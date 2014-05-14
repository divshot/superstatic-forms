var forms = require('../index.js');
var expect = require('chai').expect;
var request = require('supertest');
var connect = require('connect');
var bodyParser = require('body-parser');

var config = {
  "forms": {
    "contact": {
      "to":"Scott Corgan <scottcorgan@gmail.com>",
      // "from":"{{email}}",
      "from": "Some Guy <scott@divshot.com>",
      "subject":"Contact form filled out by {{name}}",
      "text": "HEY THERE!",
      "success": "/contact?status=success",
      "error": "/contact?status=error"
    },
    "beta": {
      "to":"beta@your-company.com",
      "subject":"Beta Signup",
      "text":"{{name}} signed up for the private beta."
    }
  }
};

/*
  Possible options:
  ====================
    - to: The email address (and name) of the recipient. This field cannot be dynamic.
    - reply_to: The reply-to address for the email, for easy followup.
    - subject: The subject of the email.
    - html: (optional) an HTML template for the body of the email. Otherwise key value pairs will be displayed nicely.
    - text: (optional) a plain text template for the body of the email.
 */

describe('forms service', function () {
  var app;
  
  beforeEach(function () {
    app = connect()
      .use(bodyParser())
      .use(function (req, res, next) {
        req.service = {
          name: 'forms',
          config: config.forms,
          path: '/forms/contact',
        };
        next();
      });
  });
  
  it('skips if it is not a post request', function (done) {
    app.use(forms());
    
    request(app)
      .get('/')
      .expect(404)
      .end(done);
  });
  
  it('skips if the request does not match a config task', function (done) {
    app
      .use(function (req, res, next) {
        req.service = {
          name: 'forms',
          config: config.forms,
          path: req.url,
        };
        next();
      })
      .use(forms());
    
    request(app)
      .post('/forms/does-not-exist')
      .expect(404)
      .end(done);
  });
  
  it.only('passes tests', function (done) {
    app.use(forms({
      from: 'Some Other Guy <scott@divshot.com>',
      transport: 'Stub',
      options: {
        // service: "Gmail",
        // auth: {
        //   user: "scottcorgan@gmail.com",
        //   pass: "Rad1alp00p!"
        // }
      }
    }));
    
    request(app)
      .post('/forms/contact')
      .set('x-requested-with', 'XMLHttpRequest')
      .send({
        email: 'test@test.com',
        name: 'test'
      })
      .expect(200)
      .expect(function (res) {
        var emailHeaders = JSON.parse(res.text);
        expect(emailHeaders.From).to.equal('"Some Guy" <scott@divshot.com>');
      })
      .end(done);
    
  });
  
  it('parses email templates with values from request');
  it('to field cannot be dynamic');
  it('parses form encoded data');
  it('parses JSON data');
  it('redirects on non xhr requests');
  it('returns a 200 on successful send from xhr request with parsed headers');
  it('returns a 500 on unsuccessful send from xhr request with error message');
  
});