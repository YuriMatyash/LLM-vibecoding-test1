# Digital Sanctuary Todo App

A minimal vanilla JavaScript todo app inspired by the provided "Digital Sanctuary" layout.

## Features

- Add tasks
- Edit tasks
- Delete tasks
- Complete and uncomplete tasks
- Filter by all / active / completed
- Clear completed tasks
- Show active task count
- Persist tasks in browser localStorage

## Data model

Each task uses the required shape:

- `id: string`
- `title: string`
- `completed: boolean`
- `createdAt: timestamp`
- `updatedAt: timestamp`

## Run locally

Open `index.html` in your browser.

## Run tests

```bash
node tests.todoStore.test.js
```
