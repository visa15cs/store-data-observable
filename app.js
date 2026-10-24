const starterCode = `class Store {
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
}`;

const store = new Store();
let keySubscription = null;
const globalSubscription = (key, newValue, oldValue) => addLog('global', key, newValue, oldValue);

function addLog(type, key, newValue, oldValue) {
  const log = document.querySelector('#activity-log');
  log.querySelector('.empty-state')?.remove();
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const message = document.createElement('div');
  message.className = 'log-message';
  const label = type === 'key' ? 'KEY' : type.toUpperCase();
  message.innerHTML = `<span class="log-tag ${type === 'global' ? 'global' : ''}">${label}</span> `;
  const detail = document.createElement('span');
  detail.append(document.createTextNode(`${key}: `));
  const oldNode = document.createElement('code'); oldNode.textContent = formatValue(oldValue);
  const newNode = document.createElement('code'); newNode.textContent = formatValue(newValue);
  detail.append(oldNode, document.createTextNode(' → '), newNode);
  message.append(detail);
  const stamp = document.createElement('span'); stamp.className = 'log-time'; stamp.textContent = time;
  entry.append(stamp, message); log.prepend(entry);
}

function formatValue(value) {
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return JSON.stringify(value);
  try { return JSON.stringify(value); } catch { return String(value); }
}

function bindKeyListener(key) {
  if (keySubscription && store.listeners.has(keySubscription.key)) store.listeners.get(keySubscription.key).delete(keySubscription.callback);
  const callback = (value, oldValue) => addLog('key', key, value, oldValue);
  if (!store.listeners.has(key)) store.listeners.set(key, new Set());
  store.listeners.get(key).add(callback);
  keySubscription = { key, callback };
  document.querySelector('#watching-key').textContent = key || '(empty key)';
}

function renderState() {
  document.querySelector('#store-state').textContent = JSON.stringify(Object.fromEntries(store.map.entries()), null, 2);
}

function showToast(text) {
  let toast = document.querySelector('.toast');
  if (!toast) { toast = document.createElement('div'); toast.className = 'toast'; document.body.append(toast); }
  toast.textContent = text; toast.classList.add('show'); clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function readKey() {
  const key = document.querySelector('#key-input').value.trim();
  if (!key) { showToast('Add a key first.'); return null; }
  return key;
}

function parseValue(input) { try { return JSON.parse(input); } catch { return input; } }

function reset() {
  store.map.clear(); store.listeners.clear(); store.globalListners.clear(); keySubscription = null;
  store.set('name', 'Vivek'); bindKeyListener('name'); store.onChange(globalSubscription);
  document.querySelector('#key-input').value = 'name'; document.querySelector('#value-input').value = '"Vivek"';
  document.querySelector('#watching-key').textContent = 'name';
  document.querySelector('#activity-log').innerHTML = '<div class="empty-state"><span>✳</span><b>Ready when you are</b><small>Make a change to see the listeners in action.</small></div>';
  renderState(); document.querySelector('#hero-value').textContent = 'Vivek';
}

document.querySelector('#source-code').textContent = starterCode;
store.set('name', 'Vivek'); bindKeyListener('name'); store.onChange(globalSubscription); renderState();
document.querySelector('#key-input').addEventListener('input', event => bindKeyListener(event.target.value.trim()));
document.querySelector('#set-button').addEventListener('click', () => {
  const key = readKey(); if (!key) return;
  const value = parseValue(document.querySelector('#value-input').value);
  store.set(key, value); renderState();
  if (key === 'name' && (typeof value === 'string' || typeof value === 'number')) document.querySelector('#hero-value').textContent = value;
});
document.querySelector('#get-button').addEventListener('click', () => {
  const key = readKey(); if (!key) return;
  const value = store.get(key); addLog('read', key, value, value); showToast(`${key} = ${formatValue(value)}`);
});
document.querySelector('#unset-button').addEventListener('click', () => {
  const key = readKey(); if (!key) return;
  const oldValue = store.get(key); const removed = store.unset(key);
  addLog('unset', key, undefined, oldValue); renderState();
  showToast(removed ? `“${key}” unset. Listeners are still active.` : `“${key}” was already empty. Listener is still active.`);
  if (key === 'name') document.querySelector('#hero-value').textContent = 'undefined';
});
document.querySelector('#reset-button').addEventListener('click', reset);
document.querySelector('#clear-log').addEventListener('click', () => {
  document.querySelector('#activity-log').innerHTML = '<div class="empty-state"><span>✳</span><b>Log cleared</b><small>New listener activity will show up here.</small></div>';
});
document.querySelector('#copy-code').addEventListener('click', async event => {
  try { await navigator.clipboard.writeText(starterCode); event.currentTarget.innerHTML = 'Copied <span>✓</span>'; setTimeout(() => { event.currentTarget.innerHTML = 'Copy code <span>▢</span>'; }, 1600); }
  catch { showToast('Select and copy the code from the panel.'); }
});
document.querySelector('#value-input').addEventListener('keydown', event => { if (event.key === 'Enter') document.querySelector('#set-button').click(); });
document.querySelector('#key-input').addEventListener('keydown', event => { if (event.key === 'Enter') document.querySelector('#set-button').click(); });

