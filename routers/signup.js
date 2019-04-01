const router = require('koa-router')()
const mysqlModel = require('../lib/mysql.js')
const md5 = require('md5')
const hadLogin = require('../middlewares/check.js').hadLogin
const moment = require('moment')
const fs = require('fs')

router.get('/signup',async(ctx, next) => {
  await hadLogin(ctx)
  await ctx.render('signup', {
    session: ctx.session
  })
})

// post 注册
router.post('/signup', async(ctx, next) => {
  // console.log(ctx.request.body)
  let {name,password,avatar}=ctx.request.body
  await mysqlModel.searchUserByName(name)
    .then(async (result) => {
      // console.log(result)
      if (result.length>0) {
        ctx.body = {
          code: 400,
          message: '用户存在'
        }  
      } else {
      
      let base64Data = avatar.replace(/^data:image\/\w+;base64,/, "")
      let dataBuffer = Buffer.from(base64Data, 'base64')

      let getName = Number(Math.random().toString().substr(3)).toString(36) + Date.now()
      await fs.writeFile('./public/images/' + getName + '.png', dataBuffer, err => { 
        if (err) throw err
        console.log('头像上传成功') 
      })
      await mysqlModel.addUser([name, md5(password), getName, moment().format('YYYY-MM-DD HH:mm:ss')])
        .then(res=>{
          console.log('注册成功',res)
          ctx.body = {
            code: 200,
            message: '注册成功'
          }
        }).catch((err)=>{
          console.log(err)
        })
      }
    })
})

module.exports=router