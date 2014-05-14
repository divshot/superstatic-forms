var forms = require('../index.js');
var expect = require('chai').expect;
var request = require('supertest');
var connect = require('connect');
var bodyParser = require('body-parser');

var config = {
  "forms": {
    "contact": {
      "to":"Company Contact <info@your-company.com>",
      "from":"{{email}}",
      "subject":"Contact form filled out by {{name}}"
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
  
  it.skip('passes tests', function (done) {
    app.use(forms());
    
    request(app)
      .post('/forms/contact')
      .send({
        email: 'test@test.com',
        name: 'test'
      })
      .end(function (err) {
        done();
      });
    
  });
  
  it('parses email templates with values from request');
  
});