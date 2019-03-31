const router = require('koa-router')();
const mysqlModel = require('../lib/mysql.js')
// const md = require('markdown-it')(); 
const  showdown  = require('showdown') 
const converter = new showdown.Converter()

// 文章页
router.get('/',async(ctx,next)=>{
  let res
  let postsLength
  await mysqlModel.searchArticleByPage(1)
    .then(result => {
      //console.log(result)
      res = result
    })
  await mysqlModel.searchAllArticle()
    .then(result=>{
      postsLength = result.length
    })    
  await ctx.render('allArticle', {
    session: ctx.session,
    posts: res,
    postsLength: postsLength,
    postsPageLength: Math.ceil(postsLength / 10), 
  })
})

router.get('/author',async(ctx,next)=>{
  let res
  let postsLength
  let name=decodeURIComponent(ctx.request.querystring.split('=')[1])
  // console.log('ctx.request.querystring', name)
  await mysqlModel.searchArticleByUser(name)
    .then(result => {
      postsLength = result.length
    })
  await mysqlModel.searchArticleByUserPage(name,1)
    .then(result => {
      res = result
  })
  await ctx.render('myArticle', {
    session: ctx.session,
    posts: res,
    postsPageLength:Math.ceil(postsLength / 10),
  })
})

module.exports=router