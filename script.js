import Task from './task.js';

const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const filterBtns = document.querySelectorAll('[data-filter]');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let filter = 'all';

const saveTasks = () => {
  localStorage.setItem('tasks', JSON.stringify(tasks));
};

const renderTasks = () => {
  taskList.innerHTML = '';

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true;
  });

  if (filteredTasks.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No more tasks pending!';
    li.style.textAlign = 'center';
    li.style.fontStyle = 'italic';
    taskList.appendChild(li);
    return;
  }

  filteredTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleComplete(task.id));

    const span = document.createElement('span');
    span.textContent = task.text;

    const actions = document.createElement('div');
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '🗑️';
    deleteBtn.style.background = 'red';
    deleteBtn.style.color = 'white';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      confirmDeleteTask(task.id);
    });

    actions.appendChild(deleteBtn);

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(actions);

    let startX = 0;
    li.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
    });
    li.addEventListener('touchend', e => {
      let endX = e.changedTouches[0].clientX;
      if (startX - endX > 80) { 
        li.classList.add('swipe-delete');
        setTimeout(() => deleteTask(task.id), 400);
      }
    });

    taskList.appendChild(li);

    requestAnimationFrame(() => li.classList.add('show'));
  });
};

const addTask = () => {
  const text = taskInput.value.trim();
  if (!text) return;
  const newTask = new Task(Date.now(), text);
  tasks.push(newTask);
  taskInput.value = '';
  saveTasks();
  renderTasks();
};

const toggleComplete = (id) => {
  tasks = tasks.map(task => 
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
};

const deleteTask = (id) => {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
};

const confirmDeleteTask = (id) => {
  const task = tasks.find(t => t.id === id);
  if (confirm(`Delete task: "${task.text}"?`)) {
    deleteTask(id);
  }
};

addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    addTask();
  }
});

filterBtns.forEach(btn => 
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filter = btn.dataset.filter;
    renderTasks();
  })
);

renderTasks();

document.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth < 768) {
    const container = document.querySelector('.container');
    container.style.width = '100%';
    container.style.height = '100vh';
    container.style.borderRadius = '0';
  }
});
