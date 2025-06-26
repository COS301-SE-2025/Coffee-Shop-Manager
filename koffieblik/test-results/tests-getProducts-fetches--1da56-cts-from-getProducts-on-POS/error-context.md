# Page snapshot

```yaml
- main:
  - img
  - heading "DieKoffieBlik" [level=2]
  - paragraph: Welcome back
  - text: Email
  - textbox "Email": test1750966242795@example.com
  - text: Password
  - link "Forgot password?":
    - /url: "#"
  - textbox "Password"
  - button "Show password":
    - img
  - checkbox "Remember me"
  - text: Remember me
  - button "Login to Account" [disabled]:
    - text: Login to Account
    - img
  - text: Don't have an account?
  - link "Create one now":
    - /url: /signup
- alert: Login - DieKoffieBlik
- button "Open Next.js Dev Tools":
  - img
```