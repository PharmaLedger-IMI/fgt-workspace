#### Configuring the Login/Registration screen

The fields and buttons that appear in this screen, their types and validations are defined in the
`pdm-trust-loader/src/skins/en/index/index.translate.json` file, that should be overwritten for each instance.

Below we can see the template form config:
```json
{
  "anchoring": "server",
  "form": {
    "title": "Please enter your credentials",
    "name": {
      "label": "Name:",
      "type": "text",
      "placeholder": "Please enter your name here...",
      "value": "a name",
      "public": true,
      "required": true
    },
    "id": {
      "label": "Id:",
      "type": "text",
      "placeholder": "Please enter your id here...",
      "value": "#ThIsIsAniD=",
      "public": true,
      "required": true
    },
    "email": {
      "label": "Email:",
      "type": "email",
      "placeholder": "Please enter your email here...",
      "value": "email@email.com",
      "public": true,
      "required": true
    },
    "tin": {
      "label": "TIN (Tax Identification Number):",
      "type": "number",
      "placeholder": "Enter your TIN (Tax Identification Number)...",
      "value": 500000000,
      "public": true,
      "required": true
    },
    "address": {
      "label": "Address:",
      "type": "text",
      "placeholder": "Enter your address...",
      "required": true,
      "value": "This in an Address"
    },
    "pass": {
      "label": "Password:",
      "type": "password",
      "placeholder": "Enter your password...",
      "required": true,
      "value": "This1sSuchAS3curePassw0rd"
    },
    "passrepeat": {
      "label": "Password:",
      "type": "password",
      "placeholder": "Repeat your password...",
      "required": true,
      "value": "This1sSuchAS3curePassw0rd"
    },
    "buttons": {
      "login": "Login",
      "register": "Register"
    }
  },
  "errors": {
    "title": "Error",
    "register": "Unable to register. Are you sure this account doesn't exist?",
    "login": "Could not Login. Maybe try registering?"
  },
  "success": {
    "register": "Registration Successful. Please Login",
    "login": "Login Successful. Please wait"
  }
}
```

**Available field types**
All those available to `ion-input` HTML elements:
 - text
 - number
 - email
 - password
 - date
 - ...

##### Validation

The available validations (for `ion-input` HTML elements only) are:
 - max
 - max-length
 - min
 - min-length
 - required
 - email