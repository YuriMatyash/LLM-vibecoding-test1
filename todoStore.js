(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
    return;
  }

  root.TodoStore = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const ALLOWED_PRIORITIES = ["low", "med", "high"];

  function createTodo(input) {
    const now = Date.now();
    const normalized = normalizeTaskInput(input);

    return {
      id: generateId(),
      name: normalized.name,
      description: normalized.description,
      dueDate: normalized.dueDate,
      priority: normalized.priority,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };
  }

  function addTodo(todos, input) {
    const normalized = normalizeTaskInput(input);
    if (!isValidTask(normalized)) {
      return todos;
    }

    return [...todos, createTodo(normalized)];
  }

  function deleteTodo(todos, id) {
    return todos.filter((todo) => todo.id !== id);
  }

  function toggleTodo(todos, id, completed) {
    const now = Date.now();
    return todos.map((todo) => (todo.id === id ? { ...todo, completed, updatedAt: now } : todo));
  }

  function editTodo(todos, id, input) {
    const normalized = normalizeTaskInput(input);
    if (!isValidTask(normalized)) {
      return todos;
    }

    const now = Date.now();
    return todos.map((todo) =>
      todo.id === id
        ? {
            ...todo,
            name: normalized.name,
            description: normalized.description,
            dueDate: normalized.dueDate,
            priority: normalized.priority,
            updatedAt: now,
          }
        : todo
    );
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

      return parsed
        .map((todo) => sanitizeStoredTodo(todo))
        .filter((todo) => !!todo);
    } catch {
      return [];
    }
  }

  function sanitizeStoredTodo(todo) {
    if (!todo || typeof todo.id !== "string" || typeof todo.completed !== "boolean") {
      return null;
    }

    const normalized = normalizeTaskInput(todo);
    if (!normalized.name || !normalized.dueDate) {
      normalized.name = normalizeText(todo.name || todo.text);
      normalized.dueDate = normalizeText(todo.dueDate);
    }

    if (!isValidTask(normalized)) {
      return null;
    }

    const createdAt = normalizeTimestamp(todo.createdAt);
    const updatedAt = normalizeTimestamp(todo.updatedAt) || createdAt;

    return {
      id: todo.id,
      name: normalized.name,
      description: normalized.description,
      dueDate: normalized.dueDate,
      priority: normalized.priority,
      completed: todo.completed,
      createdAt,
      updatedAt,
    };
  }

  function isValidTask(task) {
    return !!task.name && !!task.dueDate && ALLOWED_PRIORITIES.includes(task.priority);
  }

  function normalizeTaskInput(input) {
    const source = input && typeof input === "object" ? input : {};
    const priority = normalizePriority(source.priority);

    return {
      name: normalizeText(source.name),
      description: normalizeText(source.description),
      dueDate: normalizeText(source.dueDate),
      priority,
    };
  }

  function normalizePriority(priority) {
    const normalized = normalizeText(priority).toLowerCase();
    return ALLOWED_PRIORITIES.includes(normalized) ? normalized : "med";
  }

  function normalizeTimestamp(value) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    return Date.now();
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
