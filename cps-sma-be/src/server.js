const express = require("express");
const cors = require("cors");
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var postsRouter = require('./routes/posts');
const connectToDb = require("./utils/db");

const app = express();

app.use(express.json());
app.use(cors());

connectToDb();

app.use('/', indexRouter);
app.use("/users", usersRouter);
app.use("/posts", postsRouter);

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(`----> server started at port ${PORT}`)
);