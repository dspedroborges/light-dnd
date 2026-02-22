# @light-dnd.js

Lightweight drag and drop with zero dependencies. Just add `dnd="drag"` to draggable elements and `dnd="drop"` to containers.

## Installation

```html
<script src="light-dnd.min.js"></script>
```

## Size

- **minified:** ~2KB
- **compressed (tar.gz):** ~750 bytes

That's it. That's the whole library.

## Mobile Support

To enable drag and drop on touch devices (iOS, Android), include the polyfill before light-dnd:

```html
<script src="DragDropTouch.min.js"></script>
<script src="light-dnd.min.js"></script>
```

This polyfill is from [drag-drop-touch](https://www.npmjs.com/package/drag-drop-touch) by Bernardo Castilho, MIT licensed.

## Quick Start

**Important:** Always add `id` attributes to your containers and draggables. This is how you'll track updates via the hidden inputs.

```html
<div id="container1" dnd="drop">
  <div id="item1" dnd="drag">Item 1</div>
  <div id="item2" dnd="drag">Item 2</div>
  <div id="item3" dnd="drag">Item 3</div>
</div>

<div id="container2" dnd="drop"></div>

<input type="hidden" dnd="update">
<input type="hidden" dnd="state">

<script src="light-dnd.min.js"></script>
```

---

## HTML Attributes

### Draggable Elements

Add `dnd="drag"` to elements you want to be draggable:

```html
<div id="my-drag-item" dnd="drag">Drag me</div>
```

### Drop Containers

Add `dnd="drop"` to containers that should accept dropped items:

```html
<div id="my-drop" dnd="drop"></div>
```

For horizontal sorting, add `dnd-direction="horizontal"`:

```html
<div id="horizontal-drop" dnd="drop" dnd-direction="horizontal"></div>
```

### Drag Families

Use `dnd-family` to restrict which draggable items can be dropped into which containers:

```html
<!-- Only "blue" items can be dropped here -->
<div id="blue-container" dnd="drop" dnd-family="blue">
  <div id="item1" dnd="drag" dnd-family="blue">Blue Item</div>
</div>

<!-- Only "red" items can be dropped here -->
<div id="red-container" dnd="drop" dnd-family="red">
  <div id="item2" dnd="drag" dnd-family="red">Red Item</div>
</div>

<!-- No family = accepts anything -->
<div id="any-container" dnd="drop">
  <div id="item3" dnd="drag">Any Item</div>
</div>
```

### Hidden State Inputs

The library uses two hidden inputs to track state changes:

```html
<input type="hidden" dnd="update">
<input type="hidden" dnd="state">
```

- `[dnd="update"]` - Fires on each drop with current drag info: `{ element, drop, order }`
- `[dnd="state"]` - Fires on each drop with full state: `{ "container1": ["item1", "item2"], ... }`

The library dispatches a `change` event on these inputs whenever an item is dropped. This makes it super easy to use with HTMX:

```html
<input type="hidden" dnd="update" 
       hx-trigger="change" 
       hx-post="/reorder" 
       hx-include="[dnd='state']">
<input type="hidden" dnd="state" 
       hx-trigger="change" 
       hx-post="/reorder">
```

---

## Events

Listen to state changes via the hidden inputs:

```javascript
const updateInput = document.querySelector('[dnd="update"]');
const stateInput = document.querySelector('[dnd="state"]');

updateInput.addEventListener('change', (e) => {
  const data = JSON.parse(e.target.value);
  console.log(data);
  // { element: "item1", drop: "container1", order: 0 }
});

stateInput.addEventListener('change', (e) => {
  const state = JSON.parse(e.target.value);
  console.log(state);
  // { "container1": ["item1", "item2"] }
});
```

---

## Styling

The library automatically applies the following styles to draggable elements:

```css
[draggable="true"].dragging, [dnd="drag"].dragging {
  opacity: 0.5;
  border: 2px dashed black;
}

[dnd="drag"] {
  user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  cursor: grab;
}
```

You can override these styles in your own CSS.

---

## Complete Examples

### Basic Vertical List

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    [dnd="drop"] {
      min-height: 100px;
      border: 2px solid #ccc;
      padding: 10px;
      margin: 10px;
    }
    [dnd="drag"] {
      background: #f0f0f0;
      padding: 10px;
      margin: 5px;
      border: 1px solid #999;
    }
  </style>
</head>
<body>
  <div id="todo" dnd="drop">
    <div id="task1" dnd="drag">Buy groceries</div>
    <div id="task2" dnd="drag">Walk the dog</div>
    <div id="task3" dnd="drag">Finish report</div>
  </div>

  <input type="hidden" dnd="update">
  <input type="hidden" dnd="state">

  <script src="light-dnd.min.js"></script>
  <script>
    document.querySelector('[dnd="state"]').addEventListener('change', (e) => {
      const state = JSON.parse(e.target.value);
      console.log('Current state:', state);
    });
  </script>
</body>
</html>
```

### Horizontal Kanban Board

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    [dnd="drop"] {
      min-height: 200px;
      min-width: 200px;
      border: 2px solid #ccc;
      padding: 10px;
      display: inline-block;
      vertical-align: top;
      margin-right: 10px;
    }
    [dnd="drop"][dnd-direction="horizontal"] {
      display: flex;
      flex-direction: row;
    }
    [dnd="drag"] {
      background: #e3f2fd;
      padding: 10px;
      margin: 5px;
      border-radius: 4px;
      min-width: 80px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div id="todo" dnd="drop" dnd-direction="horizontal">
    <div id="task1" dnd="drag">Task 1</div>
    <div id="task2" dnd="drag">Task 2</div>
  </div>

  <div id="in-progress" dnd="drop" dnd-direction="horizontal"></div>
  <div id="done" dnd="drop" dnd-direction="horizontal"></div>

  <input type="hidden" dnd="update">
  <input type="hidden" dnd="state">

  <script src="light-dnd.min.js"></script>
  <script>
    document.querySelector('[dnd="state"]').addEventListener('change', (e) => {
      const state = JSON.parse(e.target.value);
      localStorage.setItem('kanbanState', JSON.stringify(state));
    });

    const saved = localStorage.getItem('kanbanState');
    if (saved) {
      const state = JSON.parse(saved);
      Object.keys(state).forEach(dropId => {
        const drop = document.getElementById(dropId);
        state[dropId].forEach(dragId => {
          const drag = document.getElementById(dragId);
          if (drag) drop.appendChild(drag);
        });
      });
    }
  </script>
</body>
</html>
```

### Multiple Lists

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .container { display: flex; gap: 20px; }
    [dnd="drop"] {
      flex: 1;
      min-height: 300px;
      border: 2px solid #333;
      padding: 10px;
      border-radius: 8px;
    }
    #todo { background: #ffebee; }
    #progress { background: #fff3e0; }
    #done { background: #e8f5e9; }
    [dnd="drag"] {
      background: white;
      padding: 12px;
      margin: 8px 0;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body>
  <div class="container">
    <div id="todo" dnd="drop">
      <div id="task1" dnd="drag">Implement login</div>
      <div id="task2" dnd="drag">Add validation</div>
    </div>
    <div id="progress" dnd="drop">
      <div id="task3" dnd="drag">Design API</div>
    </div>
    <div id="done" dnd="drop"></div>
  </div>

  <input type="hidden" dnd="update">
  <input type="hidden" dnd="state">

  <script src="light-dnd.min.js"></script>
  <script>
    document.querySelector('[dnd="update"]').addEventListener('change', (e) => {
      const data = JSON.parse(e.target.value);
      console.log(`Moved ${data.element} to ${data.drop} at position ${data.order}`);
    });

    document.querySelector('[dnd="state"]').addEventListener('change', (e) => {
      const state = JSON.parse(e.target.value);
      console.log('Full state:', state);
    });
  </script>
</body>
</html>
```

---

## Browser Support

Chrome, Firefox, Safari, Edge - any modern browser with HTML5 Drag and Drop API support.

## License

MIT
