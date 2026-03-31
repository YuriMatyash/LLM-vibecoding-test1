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

test("addTodo trims fields and appends item", () => {
  const result = TodoStore.addTodo([], {
    name: "  task  ",
    description: "  description  ",
    dueDate: " 2026-04-10 ",
    priority: " high ",
  });
  assert.equal(result.length, 1);
  assert.equal(result[0].name, "task");
  assert.equal(result[0].description, "description");
  assert.equal(result[0].dueDate, "2026-04-10");
  assert.equal(result[0].priority, "high");
  assert.equal(result[0].completed, false);
  assert.equal(typeof result[0].createdAt, "number");
  assert.equal(typeof result[0].updatedAt, "number");
});

test("addTodo rejects blank name and due date", () => {
  const blankName = TodoStore.addTodo([], {
    name: "   ",
    description: "x",
    dueDate: "2026-04-10",
    priority: "low",
  });
  const blankDate = TodoStore.addTodo([], {
    name: "Task",
    description: "x",
    dueDate: "  ",
    priority: "low",
  });

  assert.equal(blankName.length, 0);
  assert.equal(blankDate.length, 0);
});

test("addTodo falls back to medium priority for invalid value", () => {
  const result = TodoStore.addTodo([], {
    name: "Task",
    description: "desc",
    dueDate: "2026-04-10",
    priority: "urgent",
  });

  assert.equal(result.length, 1);
  assert.equal(result[0].priority, "med");
});

test("editTodo updates fields including priority", () => {
  const todos = [
    {
      id: "1",
      name: "old",
      description: "old desc",
      dueDate: "2026-04-01",
      priority: "low",
      completed: false,
      createdAt: 1,
      updatedAt: 1,
    },
  ];
  const result = TodoStore.editTodo(todos, "1", {
    name: "new value",
    description: "new desc",
    dueDate: "2026-05-02",
    priority: "high",
  });

  assert.equal(result[0].name, "new value");
  assert.equal(result[0].description, "new desc");
  assert.equal(result[0].dueDate, "2026-05-02");
  assert.equal(result[0].priority, "high");
  assert.ok(result[0].updatedAt >= 1);
});

test("toggleTodo flips completed state and updates updatedAt", () => {
  const todos = [
    {
      id: "1",
      name: "x",
      description: "",
      dueDate: "2026-04-01",
      priority: "med",
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
      name: "valid",
      description: "ok",
      dueDate: "2026-06-01",
      priority: "high",
      completed: false,
      createdAt: 1,
      updatedAt: 2,
    },
    { id: 2, name: "invalid", dueDate: "2026-06-01", priority: "high", completed: false },
    { id: "3", name: "invalid missing date", priority: "low", completed: false },
  ]);
  const result = TodoStore.parseStoredTodos(raw);
  assert.equal(result.length, 1);
  assert.equal(result[0].name, "valid");
  assert.equal(result[0].priority, "high");
});

test("parseStoredTodos defaults missing priority to medium", () => {
  const raw = JSON.stringify([
    {
      id: "1",
      name: "valid",
      description: "ok",
      dueDate: "2026-06-01",
      completed: false,
      createdAt: 1,
      updatedAt: 2,
    },
  ]);

  const result = TodoStore.parseStoredTodos(raw);
  assert.equal(result[0].priority, "med");
});

test("filterTodos supports active and completed", () => {
  const todos = [
    { id: "1", name: "a", description: "", dueDate: "2026-06-01", priority: "low", completed: false },
    { id: "2", name: "b", description: "", dueDate: "2026-06-01", priority: "high", completed: true },
  ];
  assert.equal(TodoStore.filterTodos(todos, "active").length, 1);
  assert.equal(TodoStore.filterTodos(todos, "completed").length, 1);
  assert.equal(TodoStore.countActive(todos), 1);
});
