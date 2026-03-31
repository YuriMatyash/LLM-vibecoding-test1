const STORAGE_KEY = "todo-app-items-v5";

let todos = loadTodos();
let filter = "all";
let editingId = null;

const form = document.getElementById("todo-form");
const titleInput = document.getElementById("todo-title-input");
const list = document.getElementById("todo-list");
const template = document.getElementById("todo-item-template");
const count = document.getElementById("todo-count");
const focusCount = document.getElementById("focus-count");
const filterButtons = document.querySelectorAll(".filter");
const clearCompletedButton = document.getElementById("clear-completed");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const nextTodos = TodoStore.addTodo(todos, { title: titleInput.value });
  if (nextTodos === todos) {
    titleInput.focus();
    return;
  }

  todos = nextTodos;
  form.reset();
  persist();
  render();
  titleInput.focus();
});

list.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const item = target.closest(".todo-item");
  const todoId = item?.dataset.id;
  if (!todoId) {
    return;
  }

  if (target.classList.contains("delete")) {
    todos = TodoStore.deleteTodo(todos, todoId);
    persist();
    render();
    return;
  }

  if (target.classList.contains("edit")) {
    editingId = todoId;
    render();
    return;
  }

  if (target.classList.contains("save")) {
    const editTitleInput = item.querySelector(".edit-title-input");
    const nextTodos = TodoStore.editTodo(todos, todoId, { title: editTitleInput?.value || "" });
    if (nextTodos === todos) {
      editTitleInput?.focus();
      return;
    }

    todos = nextTodos;
    editingId = null;
    persist();
    render();
    return;
  }

  if (target.classList.contains("cancel")) {
    editingId = null;
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

  todos = TodoStore.toggleTodo(todos, todoId, target.checked);
  persist();
  render();
});

list.addEventListener("keydown", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement) || !target.classList.contains("edit-title-input")) {
    return;
  }

  if (event.key === "Enter") {
    event.preventDefault();
    target.closest(".todo-item")?.querySelector(".save")?.click();
  }

  if (event.key === "Escape") {
    event.preventDefault();
    target.closest(".todo-item")?.querySelector(".cancel")?.click();
  }
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
  todos = TodoStore.clearCompleted(todos);
  persist();
  render();
});

function render() {
  list.innerHTML = "";

  const visibleTodos = TodoStore.filterTodos(todos, filter);
  if (!visibleTodos.length) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "Your sanctuary is clear. Add a task to begin.";
    list.appendChild(empty);
  }

  visibleTodos.forEach((todo) => {
    const fragment = template.content.cloneNode(true);
    const item = fragment.querySelector(".todo-item");
    const toggle = fragment.querySelector(".toggle");
    const title = fragment.querySelector(".title");
    const editTitleInput = fragment.querySelector(".edit-title-input");

    item.dataset.id = todo.id;
    item.classList.toggle("is-completed", todo.completed);
    toggle.checked = todo.completed;
    title.textContent = todo.title;
    editTitleInput.value = todo.title;

    if (editingId === todo.id) {
      item.classList.add("is-editing");
      queueMicrotask(() => editTitleInput.focus());
    }

    list.appendChild(fragment);
  });

  const remaining = TodoStore.countActive(todos);
  count.textContent = `${remaining} active task${remaining === 1 ? "" : "s"}`;
  focusCount.textContent = String(remaining);
  clearCompletedButton.disabled = !todos.some((todo) => todo.completed);
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function loadTodos() {
  return TodoStore.parseStoredTodos(localStorage.getItem(STORAGE_KEY));
}

render();
