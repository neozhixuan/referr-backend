# Backend for Referr

Sign up flow
- check if username/email exists in DB
- hashes the password in the middleware using Bcrypt, before creating a new user
- uses user's ID to create a JWT token cookie, and sets it in the response (secure httponly)

Login flow
- check if username/email exists in DB
- use Brcyptjs.compare() to check password
- uses user's ID to create a JWT token cookie, and sets it in the response (secure httponly)

Logout flow
- remove the cookie with the name "token"

Bcrypt hook
```
userSchema.pre("save", async function () {
  this.password = await bcryptjs.hash(this.password, 12);
});
```
- userSchema.pre("save", ...) registers a pre-save hook on the User model.
- The async function runs before .save() or .create() is executed.
- 12 salt rounds

