const createTableButton = document.getElementById('createTableButton');
const tablesContainer = document.getElementById('tablesContainer');

document.addEventListener('DOMContentLoaded', loadTables);

createTableButton.addEventListener('click', () => {
    const tableName = prompt('Enter a name for your new table:');
    if (tableName) {
        addTable(tableName);
        saveTable(tableName);
    }
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
        if (taskText) {
            addTask(tableName, taskList, taskText, 'gray');
            saveTask(tableName, { text: taskText, status: 'gray' });
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

function addTask(tableName, taskList, taskText, status) {
    const li = document.createElement('li');
    li.className = `task-item task-${status}`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = status === 'green';
    checkbox.className = `checkbox-${status}`;

    const taskSpan = document.createElement('span');
    taskSpan.textContent = taskText;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'delete-btn';
    deleteButton.addEventListener('click', () => {
        removeTask(tableName, taskText);
        taskList.removeChild(li);
    });

    checkbox.addEventListener('change', () => {
        const newStatus = checkbox.checked ? 'green' : 'red';
        li.className = `task-item task-${newStatus}`;
        checkbox.className = `checkbox-${newStatus}`;
        updateTaskStatus(tableName, taskText, newStatus);
    });

    li.appendChild(checkbox);
    li.appendChild(taskSpan);
    li.appendChild(deleteButton);
    taskList.appendChild(li);
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
        tables[tableName].forEach(task => addTask(tableName, taskList, task.text, task.status));
    }
}
