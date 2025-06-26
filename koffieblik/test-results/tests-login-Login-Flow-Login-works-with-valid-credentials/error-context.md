# Page snapshot

```yaml
- main:
  - img
  - heading "DieKoffieBlik" [level=2]
  - paragraph: Welcome back
  - text: Email
  - textbox "Email": testuser@example.com
  - text: Password
  - link "Forgot password?":
    - /url: "#"
  - textbox "Password": password123
  - button "Show password":
    - img
  - paragraph: Password must contain at least one uppercase letter
  - checkbox "Remember me"
  - text: Remember me
  - button "Login to Account" [disabled]:
    - text: Login to Account
    - img
  - text: Don't have an account?
  - link "Create one now":
    - /url: /signup
- alert
- button "Open Next.js Dev Tools":
  - img
```