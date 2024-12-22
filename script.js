const todoInput = document.getElementById('todoInput');

const todoList = document.getElementById('todoList');

const emptyState = document.getElementById('emptyState');

const prioritySelect = document.getElementById('prioritySelect');

const dueDateInput = document.getElementById('dueDateInput');

const today = new Date().toISOString().split('T')[0];
dueDateInput.min = today;
dueDateInput.value = today;

let currentFilter = 'all';
let todos = JSON.parse(localStorage.getItem('todos')) || [];

window.addEventListener('load', () => {
    loadTodos();
    updateStats();
    updateEmptyState();
});

todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

function updateStats() {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const pending = total - completed;
    const progress = total === 0 ? 0 : (completed / total) * 100;

    document.getElementById('totalTasks').textContent = total;
    document.getElementById('completedTasks').textContent = completed;
    document.getElementById('pendingTasks').textContent = pending;
    document.getElementById('progressFill').style.width = `${progress}%`;
}

function updateEmptyState() {
    const visibleTodos = todoList.querySelectorAll('li:not([style*="display: none"])');
    emptyState.style.display = visibleTodos.length === 0 ? 'block' : 'none';
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
}

function getDaysRemaining(dueDate) {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function getTimeStatus(dueDate) {

    const daysRemaining = getDaysRemaining(dueDate);

    if (daysRemaining < 0) return 'overdue';

    if (daysRemaining === 0) return 'due-today';

    if (daysRemaining <= 2) return 'due-soon';

    return 'on-track';
}

function createTodoElement(todo) {

    const li = document.createElement('li');

    li.className = `todo-item priority-${todo.priority}`;

    if (todo.completed) li.classList.add('completed');

    const timeStatus = getTimeStatus(todo.dueDate);

    const daysRemaining = getDaysRemaining(todo.dueDate);

    let timeText = '';


    if (daysRemaining < 0) {
        timeText = 'Overdue';
    } 
    
    else if (daysRemaining === 0) {
        timeText = 'Due today';
    } 
    
    else {
        timeText = `${daysRemaining} days left`;
    }

    li.innerHTML = `
        <div class="todo-content">
            <div class="todo-title">${todo.text}</div>
            <div class="todo-details">
                <span><i class="fa-regular fa-calendar-days"></i> ${formatDate(todo.dueDate)}</span>
                <span class="time-status ${timeStatus}"><i class="fa-solid fa-bell"></i> ${timeText}</span>
                <span><i class="fa-solid fa-bullseye"></i> ${todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}</span>
            </div>
        </div>
        <div class="actions">
            <button onclick="toggleComplete('${todo.id}')" title="Toggle Complete">
                ${todo.completed ? '<i class="fa-solid fa-rotate-left"></i>' : '<i class="fa-solid fa-check"></i>'}
            </button>
            <button class="delete" onclick="deleteTodo('${todo.id}')" title="Delete">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
    `;

    return li;
}

function addTodo() {
    const text = todoInput.value.trim();
    if (!text) {

        todoInput.classList.add('shake');

        setTimeout(() => todoInput.classList.remove('shake'), 500);

        return;
    }

    const todo = {
        id: Date.now().toString(),
        text: text,
        priority: prioritySelect.value,
        dueDate: dueDateInput.value,
        completed: false,
        createdAt: new Date().toISOString()
    };

    todos.push(todo);

    saveTodos();

    const li = createTodoElement(todo);

    todoList.appendChild(li);

    todoInput.value = '';

    prioritySelect.value = 'low';

    dueDateInput.value = today;

    li.style.animation = '';

    setTimeout(() => {
        li.style.animation = 'slideIn 0.3s ease-out forwards';
    }, 50);

    updateEmptyState();
    updateStats();
    filterTodos(currentFilter);
}

function toggleComplete(id) {

    const index = todos.findIndex(todo => todo.id === id);

    if (index !== -1) {

        todos[index].completed = !todos[index].completed;

        saveTodos();
        loadTodos();
        updateStats();
        filterTodos(currentFilter);
    }
}

function deleteTodo(id) {

    const todoItem = todoList.querySelector(`li button[onclick*="${id}"]`).closest('li');

    if (todoItem) {

        todoItem.style.animation = 'slideIn 0.3s ease-out reverse';

        setTimeout(() => {

            todos = todos.filter(todo => todo.id !== id);
            saveTodos();
            loadTodos();
            updateStats();
            updateEmptyState();
            filterTodos(currentFilter);
        }, 300);
    }
}

function saveTodos() {

    localStorage.setItem('todos', JSON.stringify(todos));
}

function loadTodos() {

    todoList.innerHTML = '';

    todos.forEach(todo => {

        const li = createTodoElement(todo);

        todoList.appendChild(li);

        li.style.animation = '';

        setTimeout(() => {
            li.style.animation = 'slideIn 0.3s ease-out forwards';
        }, 50);
    });
}

function filterTodos(filter) {
    currentFilter = filter;

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(filter)) {
            btn.classList.add('active');
        }
    });


             const items = todoList.querySelectorAll('.todo-item');
         items.forEach(item => {
        const todo = todos.find(t => item.innerHTML.includes(t.id));
        if (!todo) return;

        let show = false;
        switch (filter) {
            case 'all':
                show = true;
                break;
            case 'active':
                show = !todo.completed;
                break;
            case 'completed':
                show = todo.completed;
                break;
            case 'high':
            case 'medium':
            case 'low':
                show = todo.priority === filter;
                break;
        }

        item.style.display = show ? 'flex' : 'none';
    });

    updateEmptyState();
}

function sortTodos() {
    todos.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    loadTodos();
    filterTodos(currentFilter);
}

loadTodos();
updateStats();
filterTodos('all');

