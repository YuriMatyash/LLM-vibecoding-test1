Implement a Todo List app in this repository.

Requirements:
- Build the feature according to the existing project conventions.
- Reuse existing patterns, components, and styling where possible.
- Keep the implementation simple and maintainable.
- Add or update tests.
- Do not introduce unnecessary dependencies.

Features:
- Add, edit, delete, complete, and uncomplete tasks
- Filter by all, active, and completed
- Clear completed tasks
- Show active task count
- Persist tasks across refresh

Data model:
- id: string
- title: string
- completed: boolean
- createdAt: timestamp
- updatedAt: timestamp

Validation:
- Reject empty or whitespace-only titles
- Trim input before saving

UI:
- Responsive and minimal
- Accessible controls and labels
- Clear visual distinction for completed tasks
- Friendly empty state

Persistence:
- Store tasks locally

Work process:
1. Inspect the repository structure first
2. Implement the feature
3. Run tests/lint/build
4. Fix any issues found
5. Summarize what changed

Deliverables:
- working implementation
- tests
- short summary of files changed
