(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
    return;
  }

  root.TodoStore = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function createTodo(input) {
    const now = Date.now();
    const normalizedTitle = normalizeTitle(input?.title);

    return {
      id: generateId(),
      title: normalizedTitle,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };
  }

  function addTodo(todos, input) {
    const title = normalizeTitle(input?.title);
    if (!title) {
      return todos;
    }

    return [...todos, createTodo({ title })];
  }

  function editTodo(todos, id, input) {
    const title = normalizeTitle(input?.title);
    if (!title) {
      return todos;
    }

    const now = Date.now();
    return todos.map((todo) => (todo.id === id ? { ...todo, title, updatedAt: now } : todo));
  }

  function deleteTodo(todos, id) {
    return todos.filter((todo) => todo.id !== id);
  }

  function toggleTodo(todos, id, completed) {
    const now = Date.now();
    return todos.map((todo) => (todo.id === id ? { ...todo, completed, updatedAt: now } : todo));
  }

  function clearCompleted(todos) {
    return todos.filter((todo) => !todo.completed);
  }

  function filterTodos(todos, filter) {
    if (filter === "active") {
      return todos.filter((todo) => !todo.completed);
    }
    if (filter === "completed") {
      return todos.filter((todo) => todo.completed);
    }
    return todos;
  }

  function countActive(todos) {
    return todos.filter((todo) => !todo.completed).length;
  }

  function parseStoredTodos(raw) {
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.map(sanitizeStoredTodo).filter(Boolean);
    } catch {
      return [];
    }
  }

  function sanitizeStoredTodo(todo) {
    if (!todo || typeof todo.id !== "string" || typeof todo.completed !== "boolean") {
      return null;
    }

    const title = normalizeTitle(todo.title ?? todo.name ?? todo.text);
    if (!title) {
      return null;
    }

    const createdAt = normalizeTimestamp(todo.createdAt);
    const updatedAt = normalizeTimestamp(todo.updatedAt) || createdAt;

    return {
      id: todo.id,
      title,
      completed: todo.completed,
      createdAt,
      updatedAt,
    };
  }

  function normalizeTimestamp(value) {
    return typeof value === "number" && Number.isFinite(value) ? value : Date.now();
  }

  function normalizeTitle(title) {
    return String(title || "").trim();
  }

  function generateId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }

    return `todo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  return {
    addTodo,
    clearCompleted,
    countActive,
    deleteTodo,
    editTodo,
    filterTodos,
    parseStoredTodos,
    toggleTodo,
  };
});
