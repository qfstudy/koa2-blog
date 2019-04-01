const router = require('koa-router')();
const mysqlModel = require('../lib/mysql.js')
const noLogin = require('../middlewares/check.js').noLogin;
// const md = require('markdown-it')();
const  showdown  = require('showdown') 
const converter = new showdown.Converter()

// 编辑单篇文章页面
router.get('/article/:postId/edit', async (ctx, next) => {
  console.log('edit-------------111')
  console.log(ctx.session,ctx.params)
  console.log('edit-----------*111*--')
  let name = ctx.session.user,
    postId = ctx.params.postId,
    res;
  await noLogin(ctx)
  await mysqlModel.searchByArticleId(postId)
    .then(result => {
      res = result[0]
    })
  await ctx.render('editArticle', {
    session: ctx.session,
    postsContent: res.md,
    postsTitle: res.title,
    postId: res.id
  })
})

// post 编辑单篇文章
router.post('/article/:postId/edit', async (ctx, next) => {
  console.log('edit-------------')
  console.log(ctx.request.body)
  console.log('edit-----------**--')
  let title = ctx.request.body.title,
    content = ctx.request.body.content,
    id = ctx.session.id,
    postId = ctx.params.postId,
    allowEdit = true,
    // 现在使用markdown不需要单独转义
    newTitle = title.replace(/[<">']/g, (target) => {
      return {
        '<': '&lt;',
        '"': '&quot;',
        '>': '&gt;',
        "'": '&#39;'
      } [target]
    }),
    newContent = content.replace(/[<">']/g, (target) => {
      return {
        '<': '&lt;',
        '"': '&quot;',
        '>': '&gt;',
        "'": '&#39;'
      } [target]
    });
  await mysqlModel.searchByArticleId(postId)
    .then(res => {
      if (res[0].name != ctx.session.user) {
        allowEdit = false
      } else {
        allowEdit = true
      }
    })
  if (allowEdit) {
    await mysqlModel.updateArticle([newTitle, converter.makeHtml(content), content, postId])
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