var forms = require('../index.js');
var expect = require('chai').expect;
var request = require('supertest');
var connect = require('connect');
var config = require('./config.json');
var errors = require('../lib/errors');

describe('forms service', function () {
  var app;
  
  beforeEach(function () {   
    this.timeout(400);
    app = connect()
      .use(setupServiceConfig());
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
      .use(setupServiceConfig())
      .use(forms());
    
    request(app)
      .post('/forms/does-not-exist')
      .expect(404)
      .end(done);
  });
  
  it('sends email on xhr request, with http response', function (done) {
    app.use(forms({
      from: 'Some Other Guy <sender@test.com>',
      transport: 'Stub'
    }));
    
    request(app)
      .post('/forms/contact')
      .set('x-requested-with', 'XMLHttpRequest')
      .expect(200)
      .expect(function (res) {
        var emailHeaders = JSON.parse(res.text);
        expect(emailHeaders.from[0].address).to.equal('sender@test.com');
      })
      .end(done);
  });
  
  it('returns a default response if no configuration is provided', function (done) {
    app.use(forms());
    
    request(app)
      .post('/forms/contact')
      .set('x-requested-with', 'XMLHttpRequest')
      .expect(200)
      .expect(function (res) {
        var emailHeaders = JSON.parse(res.text);
        expect(emailHeaders.sent).to.equal(false);
        expect(emailHeaders.headers).to.not.equal(undefined);
        expect(emailHeaders.text).to.equal('HEY THERE!');
      })
      .end(done);
  });
  
  it('sends email and redirects with success value on non xhr requests', function (done) {
    app.use(forms({
      from: 'Some Other Guy <sender@test.com>',
      transport: 'Stub'
    }));
    
    request(app)
      .post('/forms/contact')
      .expect(302)
      .expect('Location', config.forms.contact.success)
      .end(done);
  });
  
  it('returns bad request if request is missing email recipient value over xhr', function (done) {
    app.use(forms({
      transport: 'Stub',
      from: 'test@test.com'
    }));
    
    request(app)
      .post('/forms/faulty')
      .set('x-requested-with', 'XMLHttpRequest')
      .expect(400)
      .expect(errors.MISSING_RECIPIENT)
      .end(done);
  });
  
  it('returns a bad request if there is no sender email set over xhr', function (done) {
    app.use(forms({
      to: 'test@test.com',
      transport: 'Stub'
    }));
    
    request(app)
      .post('/forms/faulty')
      .set('x-requested-with', 'XMLHttpRequest')
      .expect(400)
      .expect(errors.MISSING_SENDER)
      .end(done);
  });
  
  it('returns bad request if request is missing email recipient value with form request', function (done) {
    app.use(forms({
      transport: 'Stub'
    }));
    
    request(app)
      .post('/forms/faulty')
      .expect(302)
      .expect('Location', config.forms.faulty.error)
      .end(done);
  });
  
  it('parses email templates with values from request', function (done) {
    app.use(forms({
      from: 'Some Other Guy <sender@test.com>',
      transport: 'Stub'
    }));
    
    request(app)
      .post('/forms/template')
      .send({
        email: 'test@test.com',
        name: 'test'
      })
      .set('x-requested-with', 'XMLHttpRequest')
      .expect(200)
      .expect(function (res) {
        var emailHeaders = JSON.parse(res.text);
        expect(emailHeaders.subject).to.equal('test');
        expect(emailHeaders.from[0].address).to.equal('test@test.com');
      })
      .end(done);
  });
  
  it('returns a 500 on unsuccessful send from xhr request with error message', function (done) {
    app.use(forms({
      transport: 'Stub',
      from: 'test@test.com',
      options: {
        error: 'can not do'
      }
    }));
    
    request(app)
      .post('/forms/blank')
      .set('x-requested-with', 'XMLHttpRequest')
      .expect(500)
      .expect('can not do')
      .end(done);
  });
  
  it('redirects to error page if sending email is unseccessful with form request', function (done) {
    app.use(forms({
      transport: 'Stub',
      options: {
        error: 'can not do'
      }
    }));
    
    request(app)
      .post('/forms/blank')
      .expect(302)
      .expect('Location', config.forms.blank.error)
      .end(done);
  });
  
  it('defaults to a blank success page when email is sent and there is no success redirect configured', function (done) {
    app.use(forms({
      transport: 'Stub',
      from: 'test@test.com'
    }));
    
    request(app)
      .post('/forms/blank')
      .expect(200)
      .expect('Success')
      .end(done);
  });
  
  it.skip('defaults to a blank error page when email is sent and there is no error redirect configured', function (done) {
    app.use(forms({
      transport: 'Stub',
      options: {
        error: 'nope'
      }
    }));
    
    request(app)
      .post('/forms/faulty')
      .expect(500)
      .expect('Error')
      .end(done);
  });
  
});

function setupServiceConfig () {
  return function (req, res, next) {
    req.service = {
      name: 'forms',
      config: config.forms,
      path: req.url,
    };
    next();
  };
}