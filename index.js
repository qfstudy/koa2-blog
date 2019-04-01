const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const path = require('path')
const ejs = require('ejs')
const views = require('koa-views')
const session = require('koa-session-minimal')
const mysqlStore = require('koa-mysql-session')
const static = require('koa-static')

const mysqlConfig = require('./config/default.js')

const app = new Koa()

// 静态资源目录路径
app.use(static(
  path.join(__dirname, './public')
))

// 存放sessionId的cookie配置
let cookie = {
  overwrite: false // 是否允许重写
}

// session存储配置
const store = new mysqlStore({
  user: mysqlConfig.database.USERNAME,
  password: mysqlConfig.database.PASSWORD,
  database: mysqlConfig.database.DATABASE,
  host: mysqlConfig.database.HOST,
})

app.use(session({
  key: 'USERS_ID',
  store,
  cookie
}))

// 配置服务端模板渲染引擎中间件
app.use(views(path.join(__dirname, './views'), {
  extension: 'ejs'
}))

app.use(bodyParser({
  formLimit: '1mb'
}))

//路由
app.use(require('./routers/signup.js').routes())
app.use(require('./routers/signin.js').routes())
app.use(require('./routers/signout.js').routes())
app.use(require('./routers/allArticle.js').routes())
app.use(require('./routers/writeArticle.js').routes())
app.use(require('./routers/article.js').routes())
app.use(require('./routers/editArticle.js').routes())

app.listen(mysqlConfig.port)

console.log(`listening on port ${mysqlConfig.port}`)