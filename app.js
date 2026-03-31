const STORAGE_KEY = "todo-app-items-v4";

let todos = loadTodos();
let filter = "all";
let editingId = null;

const form = document.getElementById("todo-form");
const nameInput = document.getElementById("todo-name-input");
const descriptionInput = document.getElementById("todo-description-input");
const dueDateInput = document.getElementById("todo-due-date-input");
const priorityInput = document.getElementById("todo-priority-input");
const list = document.getElementById("todo-list");
const template = document.getElementById("todo-item-template");
const count = document.getElementById("todo-count");
const filterButtons = document.querySelectorAll(".filter");
const clearCompletedButton = document.getElementById("clear-completed");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  todos = TodoStore.addTodo(todos, {
    name: nameInput.value,
    description: descriptionInput.value,
    dueDate: dueDateInput.value,
    priority: priorityInput.value,
  });

  form.reset();
  priorityInput.value = "med";
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
    return;
  }

  if (target.classList.contains("save")) {
    const editNameInput = item.querySelector(".edit-name-input");
    const editDescriptionInput = item.querySelector(".edit-description-input");
    const editDueDateInput = item.querySelector(".edit-due-date-input");
    const editPriorityInput = item.querySelector(".edit-priority-input");

    todos = TodoStore.editTodo(todos, todoId, {
      name: editNameInput?.value || "",
      description: editDescriptionInput?.value || "",
      dueDate: editDueDateInput?.value || "",
      priority: editPriorityInput?.value || "",
    });
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
    empty.textContent = "No tasks yet. Add one to get started.";
    list.appendChild(empty);
  }

  visibleTodos.forEach((todo) => {
    const fragment = template.content.cloneNode(true);
    const item = fragment.querySelector(".todo-item");
    const toggle = fragment.querySelector(".toggle");
    const name = fragment.querySelector(".name");
    const description = fragment.querySelector(".description");
    const dueDate = fragment.querySelector(".due-date");
    const priority = fragment.querySelector(".priority");
    const editNameInput = fragment.querySelector(".edit-name-input");
    const editDescriptionInput = fragment.querySelector(".edit-description-input");
    const editDueDateInput = fragment.querySelector(".edit-due-date-input");
    const editPriorityInput = fragment.querySelector(".edit-priority-input");

    item.dataset.id = todo.id;
    item.classList.toggle("is-completed", todo.completed);
    item.dataset.priority = todo.priority;
    toggle.checked = todo.completed;
    name.textContent = todo.name;
    description.textContent = todo.description || "No description";
    dueDate.textContent = formatDueDate(todo.dueDate);
    priority.textContent = `Priority: ${formatPriority(todo.priority)}`;
    priority.dataset.priority = todo.priority;
    editNameInput.value = todo.name;
    editDescriptionInput.value = todo.description;
    editDueDateInput.value = todo.dueDate;
    editPriorityInput.value = todo.priority;

    if (editingId === todo.id) {
      item.classList.add("is-editing");
    }

    list.appendChild(fragment);
  });

  const remaining = TodoStore.countActive(todos);
  count.textContent = `${remaining} item${remaining === 1 ? "" : "s"} left`;
}

function formatPriority(priority) {
  if (priority === "high") {
    return "High";
  }
  if (priority === "low") {
    return "Low";
  }
  return "Medium";
}

function formatDueDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return `Due: ${value}`;
  }

  return `Due: ${date.toLocaleDateString()}`;
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function loadTodos() {
  return TodoStore.parseStoredTodos(localStorage.getItem(STORAGE_KEY));
}

render();
