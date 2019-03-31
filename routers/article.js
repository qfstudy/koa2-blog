const router = require('koa-router')();
const mysqlModel = require('../lib/mysql.js')
const moment = require('moment')
// const md = require('markdown-it')();  
const  showdown  = require('showdown') 
const converter = new showdown.Converter()

// 文章详情页
router.get('/article/:articleId', async(ctx, next) => {
  let postId = ctx.params.articleId,
    count,
    res,
    pageOne;
  await mysqlModel.searchByArticleId(postId)
    .then(result => {
      res = result
    })
  await mysqlModel.updateArticlePv(postId)
  await mysqlModel.searchCommentByPage(1, postId)
    .then(result => {
      pageOne = result
    })
  await mysqlModel.searchCommentCountById(postId)
    .then(result => {
      // console.log('count'+result)
      count = result[0].count
    })
  await ctx.render('article', {
    session: ctx.session,
    posts: res[0],
    commentLength: count,
    commentPageLength: Math.ceil(count / 10),
    pageOne: pageOne
  })
})

// 删除文章
router.post('/article/:articleId/remove', async(ctx, next) => {
  let postId = ctx.params.articleId,
  allow;
  await mysqlModel.searchByArticleId(postId)
    .then(res => {
      if (res[0].name !== ctx.session.user) {
        allow = false
      } else {
        allow = true
      }
    })
  if (allow) {
    await mysqlModel.deleteAllArticleComment(postId)
    await mysqlModel.deleteArticle(postId)
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
router.post('/article/:postId/comment', async(ctx, next) => {
  let name = ctx.session.user,
    content = ctx.request.body.content,
    postId = ctx.params.postId,
    time = moment().format('YYYY-MM-DD HH:mm:ss'),
    avatar;
  // console.log('发布评论')
  await mysqlModel.searchUser(ctx.session.user)
    .then(res => {
      avatar = res[0]['avatar']
    })
  await mysqlModel.addComment([name, converter.makeHtml(content), time, postId, avatar])
  await mysqlModel.addArticleCommentCount(postId)
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
router.post('/article/:postId/comment/:commentId/remove', async(ctx, next) => {
  let postId = ctx.params.postId,
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
      console.log(555)
      await mysqlModel.reduceArticleCommentCount(postId)
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
        message: '无权限'
      }
  }
})

module.exports=router