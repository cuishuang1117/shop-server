const express = require("express")

const router = require('./router')

const bodyParser = require('body-parser')

const app = express()

/*
  请求地址： http://localhost:5000/admin/products

*/

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(router)


app.listen(5000, "localhost", (err) => {
  if (!err){
  	console.log("服务器启动成功")
  } 
  else console.log(err);
})
