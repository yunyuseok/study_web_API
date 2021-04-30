const passport = require("passport");
const local = require("./localStrategy");
const kakao = require("./kakaoStrategy");
const { User } = require("../models");

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const exUser = await User.findOne({
        where: id,
        include: [
          {
            model: User,
            attributes: ["id", "nick"],
            as: "Followers",
          },
          {
            model: User,
            attributes: ["id", "nick"],
            as: "Followings",
          },
        ],
      });
      done(null, exUser);
    } catch (err) {
      done(err);
    }
  });

  local();
  kakao();
};
