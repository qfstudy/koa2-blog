let initTextarea = function (ele) {
  let observe
  if (window.attachEvent) {
    observe = function (element, event, handler) {
      element.attachEvent('on' + event, handler)
    }
  } else {
    observe = function (element, event, handler) {
      element.addEventListener(event, handler, false)
    }
  }
  // let ele = document.querySelector(ele) //textarea元素
  let resize = function () {
    ele.style.height = 'auto'
    ele.style.height = ele.scrollHeight + 'px'
  }

  let delayedResize = function () {
    window.setTimeout(resize, 0)
  }
  observe(ele, 'change', resize)
  observe(ele, 'cut', delayedResize)
  observe(ele, 'paste', delayedResize)
  observe(ele, 'drop', delayedResize)
  observe(ele, 'keydown', delayedResize)

  ele.focus()
  ele.select()
  resize()
}

// module.exports=initTextarea