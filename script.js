document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Variables de estado
    let currentFilter = 'all';
    const API_URL = 'http://localhost:8000/api/tasks';

    // Verificar que los elementos existen
    if (!taskForm || !taskInput || !taskList) {
        console.error('Error: Elementos del DOM no encontrados');
        return;
    }

    // Cargar tareas al iniciar
    loadTasks();
    
    // Manejar envío del formulario
    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validación mejorada
        if (!taskInput.value || typeof taskInput.value !== 'string') {
            showAlert('Por favor ingresa una tarea válida', 'error');
            return;
        }
        
        const title = taskInput.value.trim();
        
        if (title.length < 3) {
            showAlert('La tarea debe tener al menos 3 caracteres', 'error');
            return;
        }
        
        addTask(title);
        taskInput.value = '';
    });
    
    // Manejar filtros
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            loadTasks();
        });
    });
    
    // Función para cargar tareas
    async function loadTasks() {
        try {
            showLoader();
            let url = API_URL;
            if (currentFilter !== 'all') {
                url += `?completed=${currentFilter === 'completed'}`;
            }
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const tasks = await response.json();
            renderTasks(tasks);
        } catch (error) {
            console.error('Error al cargar tareas:', error);
            showAlert('Error al cargar tareas', 'error');
        } finally {
            hideLoader();
        }
    }
    
    // Función para renderizar tareas
    function renderTasks(tasks) {
        taskList.innerHTML = '';
        
        if (tasks.length === 0) {
            taskList.innerHTML = '<li class="no-tasks">No hay tareas disponibles</li>';
            return;
        }
        
        tasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskItem.dataset.id = task.id;
            
            taskItem.innerHTML = `
                <div class="task-content">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="task-text ${task.completed ? 'completed' : ''}">${escapeHTML(task.title)}</span>
                </div>
                <div class="task-actions">
                    <button class="edit-btn">Editar</button>
                    <button class="delete-btn">Eliminar</button>
                </div>
            `;
            
            taskList.appendChild(taskItem);
            
            // Eventos para los elementos recién creados
            const checkbox = taskItem.querySelector('.task-checkbox');
            const editBtn = taskItem.querySelector('.edit-btn');
            const deleteBtn = taskItem.querySelector('.delete-btn');
            const taskText = taskItem.querySelector('.task-text');
            
            checkbox.addEventListener('change', function() {
                toggleTaskCompletion(task.id, this.checked);
            });
            
            editBtn.addEventListener('click', function() {
                editTask(task.id, taskText.textContent);
            });
            
            deleteBtn.addEventListener('click', function() {
                deleteTask(task.id);
            });
        });
    }
    
    // Función para agregar tarea
    async function addTask(title) {
        try {
            showLoader();
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    title: title,
                    completed: false 
                }),
            });
            
            if (!response.ok) {
                throw new Error('Error al agregar tarea');
            }
            
            showAlert('Tarea agregada correctamente', 'success');
            loadTasks();
        } catch (error) {
            console.error('Error al agregar tarea:', error);
            showAlert('Error al agregar tarea', 'error');
        } finally {
            hideLoader();
        }
    }
    
    // Función para alternar estado de completado
    async function toggleTaskCompletion(taskId, completed) {
        try {
            const response = await fetch(`${API_URL}/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ completed }),
            });
            
            if (!response.ok) {
                throw new Error('Error al actualizar tarea');
            }
            
            loadTasks();
        } catch (error) {
            console.error('Error al actualizar tarea:', error);
            showAlert('Error al actualizar tarea', 'error');
        }
    }
    
    // Función para editar tarea
    async function editTask(taskId, currentTitle) {
        const newTitle = prompt('Editar tarea:', currentTitle);
        
        if (newTitle === null || newTitle.trim() === '') {
            return;
        }
        
        if (newTitle.trim().length < 3) {
            showAlert('La tarea debe tener al menos 3 caracteres', 'error');
            return;
        }
        
        try {
            showLoader();
            const response = await fetch(`${API_URL}/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title: newTitle.trim() }),
            });
            
            if (!response.ok) {
                throw new Error('Error al editar tarea');
            }
            
            showAlert('Tarea actualizada correctamente', 'success');
            loadTasks();
        } catch (error) {
            console.error('Error al editar tarea:', error);
            showAlert('Error al editar tarea', 'error');
        } finally {
            hideLoader();
        }
    }
    
    // Función para eliminar tarea
    async function deleteTask(taskId) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            return;
        }
        
        try {
            showLoader();
            const response = await fetch(`${API_URL}/${taskId}`, {
                method: 'DELETE',
            });
            
            if (!response.ok) {
                throw new Error('Error al eliminar tarea');
            }
            
            showAlert('Tarea eliminada correctamente', 'success');
            loadTasks();
        } catch (error) {
            console.error('Error al eliminar tarea:', error);
            showAlert('Error al eliminar tarea', 'error');
        } finally {
            hideLoader();
        }
    }
    
    // Funciones auxiliares
    function showAlert(message, type) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 3000);
    }
    
    function showLoader() {
        const loader = document.getElementById('loader') || document.createElement('div');
        loader.id = 'loader';
        loader.className = 'loader';
        document.body.appendChild(loader);
    }
    
    function hideLoader() {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.remove();
        }
    }
    
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag]));
    }
});