const express = require("express");
const app = express();
const bodyParser = require("body-parser");
require("dotenv").config();
const client = require('./connection.js')
client.connect();


const userRoutes = require("./routes/users");


const cors=require("cors");
const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}

app.use(cors(corsOptions)) // Use this after the variable declaration

app.use(express.json());
app.use(bodyParser.json());

//app.use("/plays", playsRoutes);
app.use("/user", userRoutes);

console.log("DB: "+ process.env.DB_CONNECTION);


// CORS (Cross-Origin Resource Sharing) headers to support Cross-site HTTP requests
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});




app.set('port', process.env.PORT || 5000);
app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});


app.use((err, req, res, next) => {
  const status = err.status || 500; 

  console.log(status)
  res.status(status).json({
    message: "Error not found! Status: " + status,
  });
});

module.exports = app;