/**
 * Task Flow — JavaScript AJAX Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    initForm();
    initFilters();
});

/**
 * Utility function to get Django CSRF Token
 */
function getCsrfToken() {
    if (typeof CSRF_TOKEN !== 'undefined' && CSRF_TOKEN) {
        return CSRF_TOKEN;
    }
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

/**
 * Helper to display toast notifications
 */
function showToast(message, type = 'default') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'toast-error' : type === 'success' ? 'toast-success' : ''}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

/**
 * Update the stat counters in header
 */
function updateStats() {
    const allTasks = document.querySelectorAll('.task-item');
    const completedTasks = document.querySelectorAll('.task-item.completed');
    
    const totalCount = allTasks.length;
    const completedCount = completedTasks.length;
    const pendingCount = totalCount - completedCount;

    const totalEl = document.getElementById('count-total');
    const pendingEl = document.getElementById('count-pending');
    const completedEl = document.getElementById('count-completed');

    if (totalEl) totalEl.textContent = totalCount;
    if (pendingEl) pendingEl.textContent = pendingCount;
    if (completedEl) completedEl.textContent = completedCount;

    // Toggle Empty State Visibility
    const emptyState = document.getElementById('empty-state');
    if (emptyState) {
        if (totalCount === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
        }
    }
}

/**
 * AJAX: Toggle Task Completion status using fetch()
 */
async function toggleTaskComplete(taskId) {
    const taskItem = document.getElementById(`task-item-${taskId}`);
    const checkbox = document.getElementById(`checkbox-${taskId}`);
    const badge = document.getElementById(`badge-${taskId}`);

    if (!taskItem || !checkbox) return;

    const targetUrl = URLS.toggleTaskTemplate.replace('ID', taskId);

    try {
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken()
            },
            body: JSON.stringify({
                is_completed: checkbox.checked
            })
        });

        const data = await response.json();

        if (data.success) {
            // Instantly update DOM status
            if (data.is_completed) {
                taskItem.classList.add('completed');
                taskItem.setAttribute('data-completed', 'true');
                if (badge) {
                    badge.className = 'badge badge-success';
                    badge.textContent = 'Completed';
                }
                showToast('Task marked as completed', 'success');
            } else {
                taskItem.classList.remove('completed');
                taskItem.setAttribute('data-completed', 'false');
                if (badge) {
                    if (data.is_overdue) {
                        badge.className = 'badge badge-danger';
                        badge.textContent = 'Overdue';
                    } else {
                        badge.className = 'badge badge-warning';
                        badge.textContent = 'Pending';
                    }
                }
                showToast('Task marked as pending');
            }

            updateStats();
            // Re-apply filter if active tab is active
            applyActiveFilter();
        } else {
            // Revert checkbox state on error
            checkbox.checked = !checkbox.checked;
            showToast(data.error || 'Failed to update task status.', 'error');
        }
    } catch (err) {
        console.error('Error toggling task:', err);
        checkbox.checked = !checkbox.checked;
        showToast('Network error occurred.', 'error');
    }
}

/**
 * AJAX: Delete Task using fetch()
 */
async function deleteTask(taskId) {
    const taskItem = document.getElementById(`task-item-${taskId}`);
    if (!taskItem) return;

    const targetUrl = URLS.deleteTaskTemplate.replace('ID', taskId);

    try {
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken()
            }
        });

        const data = await response.json();

        if (data.success) {
            // Play removal animation
            taskItem.classList.add('removing');

            setTimeout(() => {
                taskItem.remove();
                updateStats();
                showToast('Task deleted successfully');
            }, 300);
        } else {
            showToast(data.error || 'Failed to delete task.', 'error');
        }
    } catch (err) {
        console.error('Error deleting task:', err);
        showToast('Network error occurred.', 'error');
    }
}

/**
 * AJAX: Form Submission for adding new task
 */
function initForm() {
    const form = document.getElementById('add-task-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const titleInput = document.getElementById('task-title');
        const descInput = document.getElementById('task-description');
        const dateInput = document.getElementById('task-due-date');
        const submitBtn = document.getElementById('add-task-btn');

        const title = titleInput ? titleInput.value.strip ? titleInput.value.strip() : titleInput.value.trim() : '';
        if (!title) return;

        submitBtn.disabled = true;
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Adding...</span>';

        const payload = {
            title: title,
            description: descInput ? descInput.value.trim() : '',
            due_date: dateInput ? dateInput.value : ''
        };

        try {
            const response = await fetch(URLS.addTask, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCsrfToken()
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.success) {
                // Dynamically construct and append new task node
                const newTaskEl = createTaskDOMElement(data.task);
                const tasksContainer = document.getElementById('tasks-list');
                const emptyState = document.getElementById('empty-state');

                if (emptyState) emptyState.style.display = 'none';

                if (tasksContainer.firstChild) {
                    tasksContainer.insertBefore(newTaskEl, tasksContainer.firstChild);
                } else {
                    tasksContainer.appendChild(newTaskEl);
                }

                // Reset form
                form.reset();
                updateStats();
                applyActiveFilter();
                showToast('Task created successfully!', 'success');
            } else {
                showToast(data.error || 'Failed to add task.', 'error');
            }
        } catch (err) {
            console.error('Error adding task:', err);
            showToast('Network error while adding task.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
}

/**
 * Helper to build Task DOM node dynamically
 */
function createTaskDOMElement(task) {
    const item = document.createElement('div');
    item.className = `task-item ${task.is_completed ? 'completed' : ''} ${task.is_overdue ? 'overdue' : ''}`;
    item.id = `task-item-${task.id}`;
    item.setAttribute('data-task-id', task.id);
    item.setAttribute('data-completed', task.is_completed ? 'true' : 'false');

    let badgeHtml = '';
    if (task.is_completed) {
        badgeHtml = `<span class="badge badge-success" id="badge-${task.id}">Completed</span>`;
    } else if (task.is_overdue) {
        badgeHtml = `<span class="badge badge-danger" id="badge-${task.id}">Overdue</span>`;
    } else {
        badgeHtml = `<span class="badge badge-warning" id="badge-${task.id}">Pending</span>`;
    }

    let dueDateHtml = '';
    if (task.formatted_due_date) {
        dueDateHtml = `
            <div class="task-meta">
                <span class="due-date-tag">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    Due: ${task.formatted_due_date}
                </span>
            </div>
        `;
    }

    const descHtml = task.description 
        ? `<p class="task-description">${escapeHtml(task.description)}</p>`
        : '';

    item.innerHTML = `
        <div class="task-checkbox-wrapper">
            <input 
                type="checkbox" 
                class="task-checkbox" 
                id="checkbox-${task.id}"
                ${task.is_completed ? 'checked' : ''}
                onchange="toggleTaskComplete(${task.id})"
            >
            <label for="checkbox-${task.id}" class="custom-checkbox" aria-label="Toggle task status">
                <svg width="12" height="10" viewBox="0 0 12 10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="1.5 5 4.5 8 10.5 1.5"></polyline>
                </svg>
            </label>
        </div>

        <div class="task-details">
            <div class="task-title-row">
                <h3 class="task-title">${escapeHtml(task.title)}</h3>
                <div class="task-badges">${badgeHtml}</div>
            </div>
            ${descHtml}
            ${dueDateHtml}
        </div>

        <div class="task-actions">
            <button 
                type="button" 
                class="btn-icon btn-delete" 
                onclick="deleteTask(${task.id})" 
                title="Delete task"
                aria-label="Delete task ${escapeHtml(task.title)}"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
            </button>
        </div>
    `;

    return item;
}

/**
 * Filter Tabs Logic
 */
function initFilters() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            applyActiveFilter();
        });
    });
}

function applyActiveFilter() {
    const activeTab = document.querySelector('.tab-btn.active');
    const filter = activeTab ? activeTab.getAttribute('data-filter') : 'all';
    const tasks = document.querySelectorAll('.task-item');

    tasks.forEach(task => {
        const isCompleted = task.getAttribute('data-completed') === 'true';
        if (filter === 'all') {
            task.style.display = 'flex';
        } else if (filter === 'pending') {
            task.style.display = isCompleted ? 'none' : 'flex';
        } else if (filter === 'completed') {
            task.style.display = isCompleted ? 'flex' : 'none';
        }
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}
