class AsyncLock {
    constructor () {
      this.disable = () => {}
      this.promise = Promise.resolve()
    }
  
    enable () {
      this.promise = new Promise(resolve => this.disable = resolve)
    }
  }

  module.exports = AsyncLock;