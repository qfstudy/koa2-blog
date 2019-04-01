const router = require('koa-router')();
const mysqlModel = require('../lib/mysql.js')
const moment = require('moment')
// const md = require('markdown-it')();  
const  showdown  = require('showdown') 
const converter = new showdown.Converter()

// 文章详情页
router.get('/article/:articleId', async(ctx, next) => {
  let articleId = ctx.params.articleId,
    res,
    commentRes
  await mysqlModel.searchByArticleId(articleId)
    .then(result => {
      res = result
    })
  await mysqlModel.updateArticlePv(articleId)
  await mysqlModel.searchCommentByArticleId(articleId)
    .then(result => {
      commentRes = result
    })
  await ctx.render('article', {
    session: ctx.session,
    articles: res[0],
    commentLength: commentRes.length,//res[0].comments
    commentRes
  })
})

// 删除文章
router.post('/article/:articleId/remove', async(ctx, next) => {
  let articleId = ctx.params.articleId,
  allow;
  await mysqlModel.searchByArticleId(articleId)
    .then(res => {
      if (res[0].name !== ctx.session.user) {
        allow = false
      } else {
        allow = true
      }
    })
  if (allow) {
    await mysqlModel.deleteAllArticleComment(articleId)
    await mysqlModel.deleteArticle(articleId)
      .then(() => {
        ctx.body = {
          code: 200,
          message: '删除文章成功'
        }
      }).catch(() => {
        ctx.body = {
          code: 500,
          message: '删除文章失败'
        }
      })
  } else {
    ctx.body = {
      code: 404,
      message: '无权限'
    }
  }
})

// 发布评论
router.post('/article/:articleId/comment', async(ctx, next) => {
  let name = ctx.session.user,
    content = ctx.request.body.content,
    articleId = ctx.params.articleId,
    time = moment().format('YYYY-MM-DD HH:mm:ss'),
    avatar;
  // console.log('发布评论')
  await mysqlModel.searchUser(ctx.session.user)
    .then(res => {
      avatar = res[0]['avatar']
    })
  await mysqlModel.addComment([name, converter.makeHtml(content), time, articleId, avatar])
  await mysqlModel.addArticleCommentCount(articleId)
    .then(() => {
      ctx.body = {
        code:200,
        message:'评论成功'
      }
    }).catch(() => {
      ctx.body = {
        code: 500,
        message: '评论失败'
      }
    })
})

// 删除评论
router.post('/article/:articleId/comment/:commentId/remove', async(ctx, next) => {
  let articleId = ctx.params.articleId,
    commentId = ctx.params.commentId,
    allow;
  await mysqlModel.searchComment(commentId)
    .then(res => {
      if (res[0].name !== ctx.session.user) {
        allow = false
      } else {
        allow = true
      }
    })
    if (allow) {
      await mysqlModel.reduceArticleCommentCount(articleId)
      await mysqlModel.deleteComment(commentId)
        .then(() => {
          ctx.body = {
            code: 200,
            message: '删除评论成功'
          }
        }).catch(() => {
          ctx.body = {
            code: 500,
            message: '删除评论失败'
          }
        })
    } else {
      ctx.body = {
        code: 404,
        message: '没有权限'
      }
  }
})

module.exports=router