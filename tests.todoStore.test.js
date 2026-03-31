const assert = require("assert");
const TodoStore = require("./todoStore");

function test(name, fn) {
  try {
    fn();
    console.log(`PASS: ${name}`);
  } catch (error) {
    console.error(`FAIL: ${name}`);
    throw error;
  }
}

test("addTodo trims title and appends item", () => {
  const result = TodoStore.addTodo([], {
    title: "  task  ",
  });

  assert.equal(result.length, 1);
  assert.equal(result[0].title, "task");
  assert.equal(result[0].completed, false);
  assert.equal(typeof result[0].createdAt, "number");
  assert.equal(typeof result[0].updatedAt, "number");
});

test("addTodo rejects blank titles", () => {
  const blankTitle = TodoStore.addTodo([], {
    title: "   ",
  });

  assert.equal(blankTitle.length, 0);
});

test("editTodo updates title and updatedAt", () => {
  const todos = [
    {
      id: "1",
      title: "old",
      completed: false,
      createdAt: 1,
      updatedAt: 1,
    },
  ];

  const result = TodoStore.editTodo(todos, "1", {
    title: "new value",
  });

  assert.equal(result[0].title, "new value");
  assert.ok(result[0].updatedAt >= 1);
});

test("editTodo rejects blank title", () => {
  const todos = [
    {
      id: "1",
      title: "old",
      completed: false,
      createdAt: 1,
      updatedAt: 1,
    },
  ];

  const result = TodoStore.editTodo(todos, "1", {
    title: "   ",
  });

  assert.equal(result[0].title, "old");
});

test("toggleTodo flips completed state and updates updatedAt", () => {
  const todos = [
    {
      id: "1",
      title: "x",
      completed: false,
      createdAt: 1,
      updatedAt: 1,
    },
  ];

  const result = TodoStore.toggleTodo(todos, "1", true);
  assert.equal(result[0].completed, true);
  assert.ok(result[0].updatedAt >= 1);
});

test("parseStoredTodos ignores invalid shapes", () => {
  const raw = JSON.stringify([
    {
      id: "1",
      title: "valid",
      completed: false,
      createdAt: 1,
      updatedAt: 2,
    },
    { id: 2, title: "invalid", completed: false },
    { id: "3", title: "   ", completed: false },
  ]);

  const result = TodoStore.parseStoredTodos(raw);
  assert.equal(result.length, 1);
  assert.equal(result[0].title, "valid");
});

test("filterTodos supports active and completed", () => {
  const todos = [
    { id: "1", title: "a", completed: false },
    { id: "2", title: "b", completed: true },
  ];

  assert.equal(TodoStore.filterTodos(todos, "active").length, 1);
  assert.equal(TodoStore.filterTodos(todos, "completed").length, 1);
  assert.equal(TodoStore.countActive(todos), 1);
});

test("clearCompleted removes completed tasks", () => {
  const todos = [
    { id: "1", title: "a", completed: false },
    { id: "2", title: "b", completed: true },
  ];

  const result = TodoStore.clearCompleted(todos);
  assert.equal(result.length, 1);
  assert.equal(result[0].id, "1");
});
