class AsyncLock {
    constructor () {
      this.disable = () => {}
      this.promise = Promise.resolve();
      this.counter = 0;
    }

    increaseLock(){
      this.counter++;
    }

    decreaseLock(){
      this.counter--;

      if(this.counter >0)
        return

      this.disable();
    }
    
    enable () {
      this.counter = 1;
      this.promise = new Promise(resolve => this.disable = resolve)
      setTimeout(()=> this.counter--,500);
    }
  }

  module.exports = AsyncLock;