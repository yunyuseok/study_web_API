/* 다른 서비스에서 접근 할 때 인증을 거치는 곳 */
const express = require("express");
const jwt = require("jsonwebtoken");

const { verifyToken } = require("./middlewares");
const { Domain, User, Post, Hashtag } = require("../models");

const router = express.Router();

router.post("/token", async (req, res) => {
  const { clientSecret } = req.body; // API 사용자가 보내주는거임. 헷갈리지 말자.
  try {
    const domain = await Domain.findOne({
      where: {
        clientSecret,
      },
      include: {
        model: User,
        attributes: ["nick", "id"],
      },
    });

    if (!domain) {
      return res.status(401).json({
        code: 401,
        message: "등록되지 않은 도메인입니다. 먼저 도메인을 등록하세요.",
      });
    }
    // 도메인이 있다면 토큰을 발급.
    const token = jwt.sign(
      {
        id: domain.User.id,
        nick: domain.User.nick,
      },
      // 시크릿 털리면 에러가 난다. 유효기간이 지나도 마찬가지
      process.env.JWT_SECRET, // 시그니쳐, 위조방지를 위해 있기 때문에 털리면 안됨.
      {
        expiresIn: "1m", // 1분
        issuer: "nodebird",
      }
    );
    return res.json({
      code: 200,
      message: "토큰이 발급되었습니다.",
      token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: 500,
      message: "서버 에러",
    });
  }
});

router.get("/test", verifyToken, (req, res) => {
  res.json(req.decoded);
});

router.get("/posts/my", verifyToken, async (req, res) => {
  try {
    const posts = await Post.findAll({
      where: { UserId: req.decoded.id },
    });
    res.json({
      code: 200,
      payload: posts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      code: 500,
      message: "서버 에러",
    });
  }
});

router.get("/posts/hashtag/:title", verifyToken, async (req, res) => {
  try {
    const findHashtag = await Hashtag.findOne({
      where: { title: req.params.title },
    });
    if (!findHashtag) {
      return res.status(404).json({
        code: 404,
        message: "검색 결과가 없습니다.",
      });
    }
    const posts = await findHashtag.getPosts();
    return res.json({
      code: 200,
      payload: posts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      code: 500,
      message: "서버 에러",
    });
  }
});

module.exports = router;
