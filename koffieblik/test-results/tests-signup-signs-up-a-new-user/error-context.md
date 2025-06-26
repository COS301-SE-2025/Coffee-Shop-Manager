# Page snapshot

```yaml
- main:
  - img
  - heading "DieKoffieBlik" [level=2]
  - paragraph: Welcome
  - text: Username
  - textbox "Username": testuser
  - text: Email
  - textbox "Email": test@example.com
  - text: Password
  - textbox "Password": P@ssword123
  - button "Show password":
    - img
  - text: Confirm Password
  - textbox "Confirm Password": P@ssword123
  - text: User already registered
  - button "SignUp":
    - text: SignUp
    - img
  - text: ALready have an account?
  - link "Login now":
    - /url: /login
- alert
- button "Open Next.js Dev Tools":
  - img
```