var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const fileUpload = require("express-fileupload");
var bodyParser = require("body-parser");
const session = require("express-session");
const flash = require("connect-flash");
var indexRouter = require("./routes/index");
const swaggerUi = require("swagger-ui-express");

var app = express();
var server = require("http").createServer(app);
const io = require("socket.io")(server);
require("./processors/index");
require("./redis/redis");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(flash());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
app.use(bodyParser.json({ limit: "100mb" }));
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "100mb",
    parameterLimit: 1000000,
  })
);

app.use(express.static(path.join(__dirname, "public")));
app.use(
  "/node_modules_url",
  express.static(path.join(__dirname, "node_modules"))
);

var swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    urls: [
      {
        url: "/index/documents",
        name: "User API",
      },
      {
        url: "/index/club",
        name: "Club API",
      },
    ],
  },
};
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(null, swaggerOptions));

app.use(
  session({
    secret: "djhxc34231241252asdf23slsakdf3adsflkas2",
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 5 * 60 * 1000, // 5 minutes in milliseconds
    },
  })
);

var userRouter = require("./routes/userRouter")();
var clubRouter = require("./routes/clubRouter")();

app.use("/api", userRouter);
app.use("/api/v1", clubRouter);
app.use("/index", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

server.listen(global.appPort, (err, resu) => {
  if (err) throw err;
  console.log(`server listening on port: ${global.appPort}`);
});

module.exports = app;
