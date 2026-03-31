const STORAGE_KEY = "todo-app-items-v1";

/** @type {{id: string, text: string, completed: boolean}[]} */
let todos = loadTodos();
let filter = "all";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const template = document.getElementById("todo-item-template");
const count = document.getElementById("todo-count");
const filterButtons = document.querySelectorAll(".filter");
const clearCompletedButton = document.getElementById("clear-completed");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) {
    return;
  }

  todos.push({
    id: crypto.randomUUID(),
    text,
    completed: false,
  });

  input.value = "";
  persist();
  render();
});

list.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const item = target.closest(".todo-item");
  if (!item) {
    return;
  }

  const todoId = item.dataset.id;
  if (!todoId) {
    return;
  }

  if (target.classList.contains("delete")) {
    todos = todos.filter((todo) => todo.id !== todoId);
    persist();
    render();
  }
});

list.addEventListener("change", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement) || !target.classList.contains("toggle")) {
    return;
  }

  const item = target.closest(".todo-item");
  const todoId = item?.dataset.id;
  if (!todoId) {
    return;
  }

  todos = todos.map((todo) =>
    todo.id === todoId
      ? {
          ...todo,
          completed: target.checked,
        }
      : todo
  );
  persist();
  render();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filter = button.dataset.filter || "all";
    filterButtons.forEach((candidate) => {
      candidate.classList.toggle("is-active", candidate === button);
    });
    render();
  });
});

clearCompletedButton.addEventListener("click", () => {
  todos = todos.filter((todo) => !todo.completed);
  persist();
  render();
});

function render() {
  list.innerHTML = "";

  const visibleTodos = todos.filter((todo) => {
    if (filter === "active") {
      return !todo.completed;
    }
    if (filter === "completed") {
      return todo.completed;
    }
    return true;
  });

  visibleTodos.forEach((todo) => {
    const fragment = template.content.cloneNode(true);
    const item = fragment.querySelector(".todo-item");
    const toggle = fragment.querySelector(".toggle");
    const text = fragment.querySelector(".text");

    item.dataset.id = todo.id;
    item.classList.toggle("is-completed", todo.completed);
    toggle.checked = todo.completed;
    text.textContent = todo.text;

    list.appendChild(fragment);
  });

  const remaining = todos.filter((todo) => !todo.completed).length;
  count.textContent = `${remaining} item${remaining === 1 ? "" : "s"} left`;
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function loadTodos() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
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

render();
