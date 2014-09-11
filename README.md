# Superstatic Forms

A simple service for capturing submitted forms via email.

[![NPM Module](http://img.shields.io/npm/v/superstatic-forms.svg?style=flat)](https://npmjs.org/package/superstatic-forms)
[![Build Status](http://img.shields.io/travis/divshot/superstatic-forms.svg?style=flat)](https://travis-ci.org/divshot/superstatic-forms)

## Client Configuration

Superstatic Forms is configured by providing a JSON object with keys
named for a specific form and values as described below. For example,
your `superstatic.json` might have a section like this:

```json
{
  "forms": {
    "contact": {
      "to": "info@your-company.com",
      "from": "forms@your-company.com",
      "replyTo": "{{name}} <{{email}}>",
      "subject": "Contact Received from {{name}}",
      "html": "<b>Name:</b> {{name}}",
      "text": "Name: {{name}}",
      "success": "/contact-received",
      "failure": "/contact-failure"
    },
    "beta": {
      "to": "beta@your-company.com",
      "from": "forms@your-company.com",
      "subject": "Beta Signup",
      "text": "{{username}} ({{email}}) signed up for the private beta."
    }
  }
}
```

This would allow a form with method `POST` and action `/__/forms/contact`
to submit a contact email, and action `/__/forms/beta` to submit a beta
signup email. For example:

```html
<form method="POST" action="/__/forms/contact">
  <label>Name:</label> <input type="text" name="name">
  <label>Email:</label> <input type="email" name="email">
  <button type="submit">Contact Us</button>
</form>
```

### Configuration Options

* **to:** (required) Email address of the recipient with optional name. This field **cannot be dynamic**.
* **from:** (required) Email address to mark the email as being sent from.
* **replyTo:** (optional) Reply-to address for easy follow-up.
* **subject:** (required) Subject of the email.
* **html:** (optional) HTML template for the email body.
* **text:** (optional) Plain text template for the email body.
* **success:** (required only if it's not an ajax request) Redirect URL on successful submission.
* **failure:** (required only if it's not an ajax request) Redirect URL on failure.

The `subject`, `replyTo`, `html`, and `text` fields are all rendered using Handlebars. If you don't supply `html` or `text` a simple list of the submitted form information will be added automatically.

**Note:** To prevent spam and other abuse, the `to` address is only configurable in `superstatic.json`. It is not templatable.

## Server-Side

You must provide server-side global configuration so that Superstatic
Forms is able to send email. This service uses [nodemailer](http://nodemailer.com)
in the background, so configuration is based on that.

```js
require('superstatic-forms')({
  from: "no-reply@your-company.com",
  transport: 'SMTP',
  options: {
    // ...
  }
});
```
