const express = require('express')
const {nanoid} = require('nanoid')
const fs = require('fs')

const router = express.Router()

const pReadFile = (filePath) => {
  return new Promise((resolve, reject)=>{
    fs.readFile(filePath, 'utf8', (err, data)=>{
      if (err)
        reject(err)
      else
        {
          resolve(data)
        }
    }) 
  })
}
  
router.get("/admin/products", function (req, res) {
  pReadFile('./db.json').then(
    data => {
      const items = JSON.parse(data).items
      res.json({items})     
    }, err => {console.log(err)}
  )
  });

router.post("/admin/products", function (req, res) {
    const {name, price, id} = req.body
    if (!id) {
      req.body.id = nanoid()
      req.body.onSale = true
    }
    pReadFile('./db.json').then(
      data => {
        let items = JSON.parse(data).items //获取原来的商品列表
        const users = JSON.parse(data).users

        if (!id) {
            items = [req.body, ...items] //生成新的商品列表
        } else {
          items.forEach(item => {
            if (item.id === id) {
              item.name = name
              item.price = price
            }
          });
        }
        fs.writeFile('./db.json', JSON.stringify({items, users}), err => {   //写回数据库
          if (err)
            console.log(err.message)
        })
        res.status(200).send('OK')
      },
      err => {
        console.log("Promise reject:",err.message)
      }
    )
  });

router.post('/admin/products/delete', function(req, res) {
  const id = req.body.id
  pReadFile('./db.json').then(
    data => {
      let items = JSON.parse(data).items
      let users = JSON.parse(data).users
      items = items.filter((value)=>{
        return value.id !== id
      })
      
      fs.writeFile('./db.json', JSON.stringify({items, users}), err => {
        if (err)
          console.log(err)
      })
      res.status(200).send('OK')
    },
    err => {console.log(err)}
  )
})

router.post('/admin/products/modify', function(req, res){
  const id = req.body.id
  pReadFile('./db.json').then(
    data => {
      let items = JSON.parse(data).items
      let users = JSON.parse(data).users
      items.forEach((value)=>{
        if (value.id === id)
          value.onSale = !value.onSale
      })
      fs.writeFile('./db.json', JSON.stringify({items, users}), err=>{
        if (err)
          console.log(err)
      })
      res.status(200).send('OK')
    }
  )
})

router.post('/login/check', function(req, res) {
  const {name, pwd} = req.body
  pReadFile('./db.json').then(
    data => {
      let users = JSON.parse(data).users
      if (!users)
        return res.status(500).send('没有user')
      let ret = users.find((value)=>{
        return value.name === name && value.pwd === pwd
      })
      if (ret)
        res.status(200).json({code : 1})
      else
        res.status(200).json({code : 0})
    }
  )
})

router.post('/register', function(req, res) {
  const {name, pwd} = req.body
  pReadFile('./db.json').then(
    data => {
      let items = JSON.parse(data).items
      let users = JSON.parse(data).users
      let ret = users.find((value)=>{
        return value.name === name
      })
      if (ret)
        res.status(200).json({code : 0})
      else {        
        users = [...users, {name, pwd}]
        fs.writeFile('./db.json', JSON.stringify({items, users}), err=>{
          if (err) 
            console.log(err.message)
        })
        res.status(200).json({code : 1})
      }
    }, err=>{console.log(err)}
  )
})

router.post('/findpwd', function(req, res){
  const {name, pwd} = req.body
  pReadFile('./db.json').then(
    data => {
      const items = JSON.parse(data).items
      let users = JSON.parse(data).users
      let flag = 0
      users.forEach((value)=>{
        if (value.name === name) {
          value.pwd = pwd
          flag = 1
        }
      })
      if (flag === 0)
        return res.status(200).json({code : 0})
      fs.writeFile('./db.json', JSON.stringify({items, users}), err=>{
        if (err)
          console.log(err.message)
      })
      res.status(200).json({code : 1})
    }, err => {console.log(err)}
  )

})

module.exports = router