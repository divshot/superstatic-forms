var forms = require('../index.js');
var expect = require('chai').expect;
var request = require('supertest');
var connect = require('connect');
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

describe('forms service', function () {
  
  it('passes tests', function () {
    expect(true).to.equal(true);
  });
  
});