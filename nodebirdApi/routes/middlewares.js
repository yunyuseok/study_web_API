const jwt = require("jsonwebtoken");

module.exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    // 로그인이 되어있다.
    next(); // 다음으로 넘김
  } else {
    res.status(403).send("로그인 필요");
  }
};

module.exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // 로그아웃 되어있다.
    next(); // 다음으로 넘김
  } else {
    const message = encodeURIComponent("로그인한 상태입니다.");
    res.redirection(`/?error=${message}`);
  }
};

module.exports.verifyToken = (req, res, next) => {
  try {
    // req.headers.authorization <- jwt토큰이 들어가 있음
    // req.decoded에는 페일로드의 데이터 부분이 들어간다.
    // 이게 실패하는 경우는 토큰이 위조 됐거나 만료 됐다는거다.
    req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
    return next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      // 유효기간 초과
      return res.status(419).json({
        code: 419,
        message: "토큰이 만료되었습니다.",
      });
    }
    return res.status(401).json({
      code: 401,
      message: "유효하지 않은 토큰입니다.",
    });
  }
};
