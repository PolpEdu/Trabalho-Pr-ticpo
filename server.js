const express = require("express");
const app = express();
const bodyParser = require("body-parser");
require("dotenv").config();
const session = require("express-session");
const client = require('./API/connection.js')

client.connect().catch(e => {
  console.error('connection error', e.stack)
  //close server
  process.exit(1)
});



const userRoutes = require("./API/routes/users");
const productRoutes = require("./API/routes/products");

const cors = require("cors");
const corsOptions = {
  origin: '*',
  credentials: true,            //access-control-allow-credentials:true
  optionSuccessStatus: 200,
}

app.use(cors(corsOptions)) // Use this after the variable declaration

app.use(express.json());
app.use(bodyParser.json());

app.use("/dbproj/product", productRoutes);
app.use("/dbproj/user", userRoutes);

app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);


app.set('port', process.env.PORT || 8080);
app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});

app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  const status = err.status || 500;


  res.status(status).json({
    status_code: status,
    message: "Error not found!",
  });
});

module.exports = app;