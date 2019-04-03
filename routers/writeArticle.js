const router = require('koa-router')()
const mysqlModel = require('../lib/mysql.js')
const moment = require('moment')
const noLogin = require('../middlewares/check.js').noLogin
// const md = require('markdown-it')()
const  showdown  = require('showdown') 
const converter = new showdown.Converter()

// 发表文章页面
router.get('/write', async(ctx, next) => {
  await noLogin(ctx)
  await ctx.render('writeArticle', {
    session: ctx.session
  })
})

router.post('/write', async(ctx, next) => {
  let {title,content} = ctx.request.body
  console.log('ctx.request.body'+title,content)
  let id = ctx.session.id
  let name = ctx.session.user
  let time = moment().format('YYYY-MM-DD HH:mm:ss')
  let avatar
  console.log('write---------')
  console.log(converter.makeHtml(content))
  console.log('-------=======')
  await mysqlModel.searchUser(ctx.session.user)
    .then(res => {
      // console.log(res[0]['avatar'])
      avatar = res[0]['avatar']       
    })
  let newContent=converter.makeHtml(content).replace(/\n/gi,"<br/>")
  await mysqlModel.addArticle([name, title,newContent, content, id, time,avatar])
    .then(() => {
      ctx.body = {
        code: 200,
        message: '发布文章成功'
      }
    }).catch((err) => {
      console.log('发布失败'+err)
      ctx.body = {
        code: 500,
        message: '发布文章失败'
      }
    })
})

module.exports=router