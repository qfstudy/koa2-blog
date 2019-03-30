module.exports ={
  // 已经登录了
  hadLogin: (ctx) => {
    if (ctx.session && ctx.session.user) {    
      console.log('check--------------')
      console.log(ctx.session) 
      console.log('check========')
      ctx.redirect('/');
      return false;
    }
    return true;
  },
  //没有登录
  noLogin: (ctx) => {
    if (!ctx.session || !ctx.session.user) {     
      ctx.redirect('/signin');
      return false;
    }
    return true;
  }
}
