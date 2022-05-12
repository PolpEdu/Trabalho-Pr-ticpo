const express = require("express");
const app = express();
const bodyParser = require("body-parser");
require("dotenv").config();
const session = require("express-session");
const client = require('./API/utils/connection');
const inserfakesuperUser = require('./API/utils/fakeusers');

client.connect().catch(e => {
  console.error('connection error', e.stack)
  //close server
  process.exit(1)
});



const userRoutes = require("./API/routes/users");
const productRoutes = require("./API/routes/products");

const cors = require("cors");
const insertfakeEmpresas = require("./API/utils/fakeempresas");
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

  // to simply tests, API on initiate always has a superuser with nif 9999999
  inserfakesuperUser();
  /*
  to login with this super user:
  {
    "username": "superuser",
    "password": "sad"
  }
  */

  insertfakeEmpresas();



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
    message: "Error. Usually this error occurs when the server didn't have a response or an unformmated JSON (no comments allowed).",
  });
});

module.exports = app;