const express = require("express");
const bcrypt = require("bcrypt");
const { User } = require("../models");
const passport = require("passport");

const { isLoggedIn, isNotLoggedIn } = require("./middlewares");

const router = express.Router();

// 회원가입
router.post("/join", isNotLoggedIn, async (req, res, next) => {
  const { email, password, nick } = req.body;
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      // 중복된 아이디
      return res.redirect("/join?error=exist");
    } else {
      const hash = await bcrypt.hash(password, 12);
      await User.create({
        email,
        password: hash,
        nick,
      });
    }
    return res.redirect("/");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 로그인
router.post("/login", isNotLoggedIn, (req, res, next) => {
  passport.authenticate(
    "local" /* localStrategy로 감 */,
    (authErr, user, info) => {
      /* localStrategy.done메서드 인수들 */
      if (authErr) {
        // 에러가 있는지 확인
        console.log("여기서 오류");
        return next(authErr);
      }
      if (!user) {
        // 유저가 있는지 확인
        return res.redirect(`/?loginError?=${info.message}`);
      }
      return req.login(user, (loginError) => {
        // 끝나면 serialize로 감
        if (loginError) {
          console.error(loginError);
          return next(loginError);
        }
        return res.redirect("/");
      });
    }
  )(req, res, next);
});

router.get("/kakao", isNotLoggedIn, passport.authenticate("kakao"));

router.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);

// 로그아웃
router.get("/logout", isLoggedIn, (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
