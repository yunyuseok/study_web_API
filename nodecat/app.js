const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");

const cookieParser = require("cookie-parser");
const session = require("express-session");

const nunjucks = require("nunjucks");

dotenv.config();

const indexRouter = require("./routes");

const app = express();

app.set("port", process.env.PORT || 4000);
app.set("view engine", "html");

nunjucks.configure("views", {
  express: app,
  watch: true,
});

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);

// 커스텀 라우터
app.use("/", indexRouter);

//에러처리 라우터
app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== "production" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

app.listen(app.get("port"), () => {
  console.log(`${app.get("port")}포트에서 대기중입니다.`);
});
