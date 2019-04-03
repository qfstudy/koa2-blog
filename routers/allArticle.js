const router = require('koa-router')();
const mysqlModel = require('../lib/mysql.js')

// 文章页
router.get('/',async(ctx,next)=>{
  let res
  await mysqlModel.searchAllArticle()
    .then(result=>{
      res = result
    })  
  
  res.forEach((item)=>{
    item.content=item.content.split('<pre>')[0].replace(/<[^>]+>/g,"").trim()
  })
  
  await ctx.render('allArticle', {
    session: ctx.session,
    articles: res
  })
})

router.get('/author',async(ctx,next)=>{
  let res
  let name=decodeURIComponent(ctx.request.querystring.split('=')[1])
  await mysqlModel.searchArticleByUser(name)
    .then(result => {
      res = result
    })
  res.forEach((item)=>{
    item.content=item.content.split('<pre>')[0].replace(/<[^>]+>/g,"").trim()
  })
  await ctx.render('myArticle', {
    session: ctx.session,
    articles: res
  })
})

module.exports=router