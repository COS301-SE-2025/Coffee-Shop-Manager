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
  - textbox "Password": StrongP@ssw0rd
  - button "Show password":
    - img
  - checkbox "Remember me"
  - text: Remember me Invalid login credentials
  - button "Login to Account":
    - text: Login to Account
    - img
  - text: Don't have an account?
  - link "Create one now":
    - /url: /signup
- alert
- button "Open Next.js Dev Tools":
  - img
```