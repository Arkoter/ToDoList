const createTableButton = document.getElementById('createTableButton');
const tablesContainer = document.getElementById('tablesContainer');
const searchInput = document.getElementById('searchInput');
const lightThemeButton = document.getElementById('lightThemeButton');
const darkThemeButton = document.getElementById('darkThemeButton');

document.addEventListener('DOMContentLoaded', loadTables);

createTableButton.addEventListener('click', () => {
    const tableName = prompt('Enter a name for your new table:');
    if (tableName) {
        addTable(tableName);
        saveTable(tableName);
    }
});

searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const tasks = document.querySelectorAll('.task-item');
    tasks.forEach(task => {
        if (task.textContent.toLowerCase().includes(searchTerm)) {
            task.style.display = '';
        } else {
            task.style.display = 'none';
        }
    });
});

lightThemeButton.addEventListener('click', () => {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    localStorage.setItem('theme', 'light');
});

darkThemeButton.addEventListener('click', () => {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    localStorage.setItem('theme', 'dark');
});

function addTable(tableName) {
    const tableDiv = document.createElement('div');
    tableDiv.className = 'table';

    const headerDiv = document.createElement('div');
    headerDiv.className = 'table-header';

    const title = document.createElement('h2');
    title.textContent = tableName;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete Table';
    deleteButton.className = 'delete-btn';
    deleteButton.addEventListener('click', () => {
        removeTable(tableName);
        tablesContainer.removeChild(tableDiv);
    });

    headerDiv.appendChild(title);
    headerDiv.appendChild(deleteButton);

    const inputSection = document.createElement('div');
    inputSection.className = 'input-section';

    const taskInput = document.createElement('input');
    taskInput.type = 'text';
    taskInput.placeholder = 'Add a new task...';

    const addTaskButton = document.createElement('button');
    addTaskButton.textContent = 'Add Task';
    addTaskButton.addEventListener('click', () => {
        const taskText = taskInput.value.trim();
        const taskPriority = prompt('Enter a priority for your task (High, Medium, Low):');
        if (taskText) {
            const taskData = {
                text: taskText,
                status: 'gray',
                priority: taskPriority || 'Medium',
                timestamp: new Date().toLocaleString(),
                subTasks: []
            };
            addTask(tableName, taskList, taskData);
            saveTask(tableName, taskData);
            taskInput.value = '';
        }
    });

    inputSection.appendChild(taskInput);
    inputSection.appendChild(addTaskButton);

    const taskList = document.createElement('ul');
    taskList.className = 'task-list';

    tableDiv.appendChild(headerDiv);
    tableDiv.appendChild(inputSection);
    tableDiv.appendChild(taskList);

    tablesContainer.appendChild(tableDiv);
}

function addTask(tableName, taskList, taskData) {
    const li = document.createElement('li');
    li.className = `task-item task-${taskData.status}`;
    li.draggable = true;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = taskData.status === 'green';
    checkbox.className = `checkbox-${taskData.status}`;

    const taskSpan = document.createElement('span');
    taskSpan.textContent = `${taskData.text} (${taskData.priority} - ${taskData.timestamp})`;

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.className = 'edit-btn';
    editButton.addEventListener('click', () => {
        const newText = prompt('Edit your task:', taskData.text);
        const newPriority = prompt('Edit your task priority:', taskData.priority);
        if (newText) {
            taskData.text = newText;
            taskData.priority = newPriority || 'Medium';
            taskSpan.textContent = `${newText} (${taskData.priority} - ${taskData.timestamp})`;
            updateTask(tableName, taskData);
        }
    });

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'delete-btn';
    deleteButton.addEventListener('click', () => {
        removeTask(tableName, taskData.text);
        taskList.removeChild(li);
    });

    checkbox.addEventListener('change', () => {
        const newStatus = checkbox.checked ? 'green' : 'red';
        li.className = `task-item task-${newStatus}`;
        checkbox.className = `checkbox-${newStatus}`;
        taskData.status = newStatus;
        updateTaskStatus(tableName, taskData.text, newStatus);
    });

    li.appendChild(checkbox);
    li.appendChild(taskSpan);
    li.appendChild(editButton);
    li.appendChild(deleteButton);
    taskList.appendChild(li);

    li.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text', taskData.text);
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => li.classList.add('dragging'), 0);
    });

    li.addEventListener('dragend', () => {
        li.classList.remove('dragging');
    });

    taskList.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(taskList, e.clientY);
        const dragging = document.querySelector('.dragging');
        if (afterElement == null) {
            taskList.appendChild(dragging);
        } else {
            taskList.insertBefore(dragging, afterElement);
        }
    });

    taskList.addEventListener('drop', (e) => {
        e.preventDefault();
        updateOrder(tableName);
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function saveTable(tableName) {
    let tables = JSON.parse(localStorage.getItem('tables')) || {};
    if (!tables[tableName]) {
        tables[tableName] = [];
    }
    localStorage.setItem('tables', JSON.stringify(tables));
}

function saveTask(tableName, task) {
    let tables = JSON.parse(localStorage.getItem('tables')) || {};
    if (tables[tableName]) {
        tables[tableName].push(task);
        localStorage.setItem('tables', JSON.stringify(tables));
    }
}

function updateTask(tableName, taskData) {
    let tables = JSON.parse(localStorage.getItem('tables')) || {};
    if (tables[tableName]) {
        tables[tableName] = tables[tableName].map(task => {
            if (task.text === taskData.text) {
                return taskData;
            }
            return task;
        });
        localStorage.setItem('tables', JSON.stringify(tables));
    }
}

function updateTaskStatus(tableName, taskText, newStatus) {
    let tables = JSON.parse(localStorage.getItem('tables')) || {};
    if (tables[tableName]) {
        tables[tableName] = tables[tableName].map(task => {
            if (task.text === taskText) {
                return { ...task, status: newStatus };
            }
            return task;
        });
        localStorage.setItem('tables', JSON.stringify(tables));
    }
}

function removeTable(tableName) {
    let tables = JSON.parse(localStorage.getItem('tables')) || {};
    delete tables[tableName];
    localStorage.setItem('tables', JSON.stringify(tables));
}

function removeTask(tableName, taskText) {
    let tables = JSON.parse(localStorage.getItem('tables')) || {};
    if (tables[tableName]) {
        tables[tableName] = tables[tableName].filter(task => task.text !== taskText);
        localStorage.setItem('tables', JSON.stringify(tables));
    }
}

function loadTables() {
    const tables = JSON.parse(localStorage.getItem('tables')) || {};
    for (const tableName in tables) {
        addTable(tableName);
        const taskList = document.querySelector(`.table:last-child .task-list`);
        tables[tableName].forEach(task => addTask(tableName, taskList, task));
    }

    const theme = localStorage.getItem('theme') || 'light';
    document.body.classList.add(`${theme}-theme`);
}

function updateOrder(tableName) {
    const taskList = document.querySelector(`.table h2:contains('${tableName}')`).parentElement.parentElement.querySelector('.task-list');
    const tasks = Array.from(taskList.children).map(task => task.querySelector('span').textContent.split(' (')[0]);
    let tables = JSON.parse(localStorage.getItem('tables')) || {};
    if (tables[tableName]) {
        tables[tableName] = tables[tableName].sort((a, b) => tasks.indexOf(a.text) - tasks.indexOf(b.text));
        localStorage.setItem('tables', JSON.stringify(tables));
    }
}
