# Superstatic Forms

A simple service for capturing submitted forms via email.

## Client Configuration

Superstatic Forms is configured by providing a JSON object with keys
named for a specific form and values as described below. For example,
your `superstatic.json` might have a section like this:

```json
{
  "forms": {
    "contact": {
      "to":"Company Contact <info@your-company.com>",
      "subject":"Contact form filled out by {{name}}"
    },
    "beta": {
      "to":"beta@your-company.com",
      "subject":"Beta Signup",
      "body":"{{name}} signed up for the private beta."
    }
  }
}
```

## Server-Side

You must provide server-side global configuration so that Superstatic
Forms is able to send email. This service uses [nodemailer](http://nodemailer.com)
in the background, so configuration is based on that.

```js
require('superstatic-forms')({
  transport: 'SMTP',
  options: {
    // ...
  }
});
```
