

export default class WebController{
  constructor(...args){
    console.log(`Called constructor of Mock Controller with args:`, ...args)
  }

  on(...args){
    console.log(`Called ON on the mock Controller with args:`, ...args)
  }
}
