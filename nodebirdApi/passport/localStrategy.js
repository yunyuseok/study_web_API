const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const { User } = require("../models");

module.exports = () => {
  passport.use(
    new localStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const exUser = await User.findOne({ where: { email } });
          if (exUser) {
            const result = await bcrypt.compare(password, exUser.password);
            if (result) {
              done(null, exUser);
            } else {
              done(null, false, "비밀번호가 일치하지 않습니다.");
            }
          } else {
            done(null, false, "가입되지 않은 회원입니다.");
          }
        } catch (err) {
          console.error(err);
          done(err);
        }
      }
    )
  );
};
