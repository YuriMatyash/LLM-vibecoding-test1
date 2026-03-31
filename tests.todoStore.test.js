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

test("addTodo trims text and appends item", () => {
  const result = TodoStore.addTodo([], "  task  ");
  assert.equal(result.length, 1);
  assert.equal(result[0].text, "task");
  assert.equal(result[0].completed, false);
});

test("editTodo updates text", () => {
  const todos = [{ id: "1", text: "old", completed: false }];
  const result = TodoStore.editTodo(todos, "1", "new value");
  assert.equal(result[0].text, "new value");
});

test("editTodo removes item when text is blank", () => {
  const todos = [{ id: "1", text: "old", completed: false }];
  const result = TodoStore.editTodo(todos, "1", "   ");
  assert.equal(result.length, 0);
});

test("toggleTodo flips completed state", () => {
  const todos = [{ id: "1", text: "x", completed: false }];
  const result = TodoStore.toggleTodo(todos, "1", true);
  assert.equal(result[0].completed, true);
});

test("parseStoredTodos ignores invalid shapes", () => {
  const raw = JSON.stringify([
    { id: "1", text: "valid", completed: false },
    { id: 2, text: "invalid", completed: false },
  ]);
  const result = TodoStore.parseStoredTodos(raw);
  assert.deepEqual(result, [{ id: "1", text: "valid", completed: false }]);
});

test("filterTodos supports active and completed", () => {
  const todos = [
    { id: "1", text: "a", completed: false },
    { id: "2", text: "b", completed: true },
  ];
  assert.equal(TodoStore.filterTodos(todos, "active").length, 1);
  assert.equal(TodoStore.filterTodos(todos, "completed").length, 1);
  assert.equal(TodoStore.countActive(todos), 1);
});
