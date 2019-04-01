const router = require('koa-router')();
const mysqlModel = require('../lib/mysql.js')
const noLogin = require('../middlewares/check.js').noLogin;
// const md = require('markdown-it')();
const  showdown  = require('showdown') 
const converter = new showdown.Converter()

// 编辑单篇文章页面
router.get('/article/:articleId/edit', async (ctx, next) => {
  let articleId = ctx.params.articleId
  let res
  await noLogin(ctx)
  await mysqlModel.searchByArticleId(articleId)
    .then(result => {
      res = result[0]
    })
  await ctx.render('editArticle', {
    session: ctx.session,
    articleContent: res.md,
    articleTitle: res.title,
    articleId: res.id
  })
})

// post 编辑单篇文章
router.post('/article/:articleId/edit', async (ctx, next) => {
  let title = ctx.request.body.title,
    content = ctx.request.body.content,
    articleId = ctx.params.articleId,
    allowEdit = true
  await mysqlModel.searchByArticleId(articleId)
    .then(res => {
      if (res[0].name != ctx.session.user) {
        allowEdit = false
      } else {
        allowEdit = true
      }
    })
  if (allowEdit) {
    await mysqlModel.updateArticle([title, converter.makeHtml(content), content, articleId])
      .then(() => {
        ctx.body = {
          code: 200,
          message: '编辑成功'
        }
      }).catch(() => {
        ctx.body = {
          code: 500,
          message: '编辑失败'
        }
      })
  } else {
    ctx.body = {
      code: 404,
      message: '无权限'
    }
  }
})

module.exports = router