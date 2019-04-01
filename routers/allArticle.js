const router = require('koa-router')();
const mysqlModel = require('../lib/mysql.js')
// const md = require('markdown-it')(); 
const  showdown  = require('showdown') 
const converter = new showdown.Converter()

// 文章页
router.get('/',async(ctx,next)=>{
  let res
  await mysqlModel.searchAllArticle()
    .then(result=>{
      res = result
    })    
  await ctx.render('allArticle', {
    session: ctx.session,
    articles: res
  })
})

router.get('/author',async(ctx,next)=>{
  let res
  let name=decodeURIComponent(ctx.request.querystring.split('=')[1])
  // console.log('ctx.request.querystring', name)
  await mysqlModel.searchArticleByUser(name)
    .then(result => {
      res = result
    })
  await ctx.render('myArticle', {
    session: ctx.session,
    articles: res
  })
})

module.exports=router