(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
    return;
  }

  root.TodoStore = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function createTodo(text) {
    return {
      id: generateId(),
      text: normalizeText(text),
      completed: false,
    };
  }

  function addTodo(todos, text) {
    const normalized = normalizeText(text);
    if (!normalized) {
      return todos;
    }

    return [...todos, createTodo(normalized)];
  }

  function deleteTodo(todos, id) {
    return todos.filter((todo) => todo.id !== id);
  }

  function toggleTodo(todos, id, completed) {
    return todos.map((todo) => (todo.id === id ? { ...todo, completed } : todo));
  }

  function editTodo(todos, id, text) {
    const normalized = normalizeText(text);
    if (!normalized) {
      return deleteTodo(todos, id);
    }

    return todos.map((todo) => (todo.id === id ? { ...todo, text: normalized } : todo));
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

      return parsed.filter(
        (todo) =>
          todo &&
          typeof todo.id === "string" &&
          typeof todo.text === "string" &&
          typeof todo.completed === "boolean"
      );
    } catch {
      return [];
    }
  }

  function normalizeText(text) {
    return String(text || "").trim();
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
