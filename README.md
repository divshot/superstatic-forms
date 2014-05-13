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
      "from":"{{email}}",
      "subject":"Contact form filled out by {{name}}"
    },
    "beta": {
      "to":"beta@your-company.com",
      "subject":"Beta Signup",
      "text":"{{name}} signed up for the private beta."
    }
  }
}
```

This would allow a form with method `POST` and action `/__/forms/contact`
to submit a contact email, and action `/__/forms/beta` to submit a beta
signup email.

### List of Configuration Options

* **to:** The email address (and name) of the recipient. This field **cannot be dynamic**.
* **reply_to:** The reply-to address for the email, for easy followup.
* **subject:** The subject of the email.
* **html:** (optional) an HTML template for the body of the email. Otherwise key value pairs will be displayed nicely.
* **text:** (optional) a plain text template for the body of the email.

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
