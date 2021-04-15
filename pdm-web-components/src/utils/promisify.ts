export function promisifyEventEmit(event, args = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    event.emit({
      ...args,
      callback: (error, data) => {
        if (error) {
          reject(error);
        }
        resolve(data);
      },
    });
  });
}

export function promisifyEventDispatch(eventName: string, host: HTMLElement, args = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    host.dispatchEvent(
      new CustomEvent(eventName, {
        bubbles: true,
        composed: true,
        cancelable: true,
        detail: {
          callback: (error, data) => {
            if (error) {
              reject(error);
            }
            resolve(data);
          },
        },
        ...args,
      }),
    );
  });
}
