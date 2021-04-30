const express = require("express");
const axios = require("axios");

const router = express.Router();

const URL = "http://localhost:3001/v1";
axios.defaults.headers.origin = "http://localhost:4000"; // API에서 누가 요청을 보냈는지 확인하기 위해서 사용

// 토큰이 만료되었을 경우 자동으로 재발급 받고 하던일 다시 실행 해주는 함수
const request = async (req, api) => {
  try {
    if (!req.session.jwt) {
      // 토큰이 없으면 발행
      const tokenResult = await axios.post(`${URL}/token`, {
        clientSecret: process.env.CLIENT_SECRET,
      });
      req.session.jwt = tokenResult.data.token;
    }
    // 없으면 재발행, 있으면 바로 요청
    return await axios.get(`${URL}${api}`, {
      headers: { authorization: req.session.jwt },
    });
  } catch (err) {
    if (err.response.status === 419) {
      // 토큰 만료시
      delete req.session.jwt;
      return request(req, api);
    }
    return err.response;
  }
};

router.get("/myposts", async (req, res, next) => {
  try {
    const result = await request(req, "/posts/my");
    res.json(result.data);
  } catch (err) {
    console.error(err);
    next(err);
  }
});
router.get("/search/:hashtag", async (req, res, next) => {
  try {
    const result = await request(
      req,
      `/posts/hashtag/${encodeURIComponent(req.params.hashtag)}`
    );
    res.json(result.data);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
