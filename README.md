# StoreData Observable

A small, interactive vanilla JavaScript demo of a key-value store with observable change listeners. It grew out of an interview exercise: keep values in one place, then notify the right subscribers when something changes.

## Try it

Open `index.html` in a browser. There is no build step and no dependency to install. The playground lets you set, get, and unset values while key-specific and global listeners report activity in real time.

## What it demonstrates

- `set(key, value)` stores a value and notifies listeners with `(newValue, oldValue)`.
- `get(key)` returns the current value.
- `unset(key)` removes the value while keeping its listeners subscribed.
- `onChange(key, callback)` subscribes to one key; multiple callbacks can watch the same key.
- `onChange(callback)` subscribes to every key. The callback receives `(key, newValue, oldValue)`.

## Use the Store

```js
const store = new Store();

store.onChange("name", (newValue, oldValue) => {
  console.log("Name changed:", oldValue, "->", newValue);
});

store.onChange((key, newValue, oldValue) => {
  console.log("Global:", key, oldValue, "->", newValue);
});

store.set("name", "Vivek");
store.set("name", "Rahul");
store.unset("name"); // removes the value; both subscriptions remain
store.set("name", "Vivek"); // the same listeners still hear this change
```

The key-specific callback receives the new value first and the old value second. The global callback also receives the changed key. `unset()` intentionally removes only the value from the `Map`; it does not touch the listener registry.

## Project files

- `index.html` — the app layout and written walkthrough
- `styles.css` — responsive styling
- `store.js` — the Store class
- `app.js` — the interactive playground

## Notes

This is an in-memory store for learning and interview practice. It does not persist data after a page reload. It uses the browser's native JavaScript features and has no framework or package dependencies.

## License

MIT

