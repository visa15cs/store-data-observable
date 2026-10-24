// Store implementation from Vivek's interview exercise.
class Store {
  map = new Map();
  listeners = new Map();
  globalListners = new Set();

  constructor() {}

  set(key, value) {
    const oldValue = this.map.get(key);
    this.map.set(key, value);
    const list = this.listeners.get(key);
    if (list) {
      list.forEach((element) => {
        element(value, oldValue);
      });
    }
    if (this.globalListners.size) {
      this.globalListners.forEach((cb) => cb(key, value, oldValue));
    }
  }

  get(key) {
    return this.map.get(key);
  }

  // Soft delete: clear the value, but keep subscriptions for a later set().
  unset(key) {
    return this.map.delete(key);
  }

  onChange(key, cb) {
    if (typeof key === 'function') {
      this.globalListners.add(key);
    } else {
      if (!this.listeners.has(key)) {
        this.listeners.set(key, new Set());
      }
      this.listeners.get(key).add(cb);
    }
  }
}

window.Store = Store;

