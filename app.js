const STORAGE_KEY = "todo-app-items-v2";

let todos = loadTodos();
let filter = "all";
let editingId = null;

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const template = document.getElementById("todo-item-template");
const count = document.getElementById("todo-count");
const filterButtons = document.querySelectorAll(".filter");
const clearCompletedButton = document.getElementById("clear-completed");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  todos = TodoStore.addTodo(todos, input.value);
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
  }

  if (target.classList.contains("save")) {
    const editInput = item.querySelector(".edit-input");
    todos = TodoStore.editTodo(todos, todoId, editInput?.value || "");
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
  if (!(target instanceof HTMLInputElement) || !target.classList.contains("edit-input")) {
    return;
  }

  const item = target.closest(".todo-item");
  const todoId = item?.dataset.id;
  if (!todoId) {
    return;
  }

  if (event.key === "Enter") {
    todos = TodoStore.editTodo(todos, todoId, target.value);
    editingId = null;
    persist();
    render();
  } else if (event.key === "Escape") {
    editingId = null;
    render();
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

  visibleTodos.forEach((todo) => {
    const fragment = template.content.cloneNode(true);
    const item = fragment.querySelector(".todo-item");
    const toggle = fragment.querySelector(".toggle");
    const text = fragment.querySelector(".text");
    const editInput = fragment.querySelector(".edit-input");

    item.dataset.id = todo.id;
    item.classList.toggle("is-completed", todo.completed);
    toggle.checked = todo.completed;
    text.textContent = todo.text;
    editInput.value = todo.text;

    if (editingId === todo.id) {
      item.classList.add("is-editing");
    }

    list.appendChild(fragment);
  });

  const remaining = TodoStore.countActive(todos);
  count.textContent = `${remaining} item${remaining === 1 ? "" : "s"} left`;
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function loadTodos() {
  return TodoStore.parseStoredTodos(localStorage.getItem(STORAGE_KEY));
}

render();
