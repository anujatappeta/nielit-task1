# 📋 Django Task Management System

![Django](https://img.shields.io/badge/Django-5.0+-092E20?style=for-the-badge&logo=django&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![HTML5/CSS3/JS](https://img.shields.io/badge/Frontend-HTML5%20%7C%20CSS3%20%7C%20JS-E34F26?style=for-the-badge&logo=html5&logoColor=white)

A clean, responsive, full-stack **Task Management Web Application** built with **Django**, **Python**, and modern dynamic **JavaScript AJAX**. Designed for organizing daily tasks, tracking due dates, viewing task completion stats, and streamlining workflow without page reloads.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation Instructions](#-installation-instructions)
- [Running the Application](#-running-the-application)
- [URL Routes & API Endpoints](#-url-routes--api-endpoints)
- [Django Admin Access](#-django-admin-access)
- [License & Acknowledgments](#-license--acknowledgments)

---

## ✨ Features

- 📝 **Task Creation**: Easily add new tasks with title, detailed descriptions, and due dates.
- ⚡ **AJAX Interactions**: Seamlessly add, mark as complete/incomplete, and delete tasks asynchronously without full page refreshes.
- 📊 **Real-time Statistics**: Dynamic counters for total tasks, completed tasks, and pending items.
- ⏰ **Overdue Detection**: Automated highlight indicators for tasks that are past their target due date.
- 🎨 **Responsive UI**: Intuitive interface styled with modern CSS, clean cards, hover states, and status badges.
- 🛡️ **Django Admin Integration**: Full administrative control over models, data management, and user permissions.

---

## 🛠️ Tech Stack

- **Backend Framework**: [Django 5.0](https://www.djangoproject.com/)
- **Programming Language**: [Python 3.10+](https://www.python.org/)
- **Database**: SQLite3 (default embedded database)
- **Frontend**: HTML5, CSS3, JavaScript (Fetch API / Async AJAX)

---

## 📁 Project Structure

```text
django_project1/
├── manage.py              # Django project management script
├── requirements.txt       # Project dependencies
├── db.sqlite3             # SQLite database file
├── taskmanager/           # Project configuration directory
│   ├── __init__.py
│   ├── asgi.py            # ASGI entry-point for web servers
│   ├── settings.py        # Project settings & configurations
│   ├── urls.py            # Core URL routing
│   └── wsgi.py            # WSGI entry-point for web servers
└── tasks/                 # Primary tasks Django app
    ├── admin.py           # Django admin customization
    ├── apps.py            # Tasks app configuration
    ├── models.py          # Database models (Task schema)
    ├── static/            # Static files (CSS styles)
    │   └── css/
    │       └── style.css
    ├── templates/         # HTML Templates
    │   └── tasks/
    │       └── task_list.html
    ├── urls.py            # App-specific URL routes
    └── views.py           # Business logic & view functions
```

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Python 3.10** or higher ([Download Python](https://www.python.org/downloads/))
- **pip** (Python package installer)
- **git** (Optional, for repository management)

Verify installations by running:
```bash
python --version
pip --version
```

---

## 🚀 Installation Instructions

Follow these step-by-step instructions to get a local development environment up and running:

### 1. Clone or Download the Project

Navigate to your desired directory and clone/extract the project:
```bash
cd /path/to/desired/directory
```

### 2. Set Up a Virtual Environment

It is recommended to use a Python virtual environment to isolate project dependencies.

**On Windows (PowerShell / Command Prompt):**
```powershell
python -m venv venv
.\venv\Scripts\activate
```

**On macOS / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

Install required packages specified in `requirements.txt`:
```bash
pip install -r requirements.txt
```

*(Alternatively, install Django directly if `requirements.txt` is not used: `pip install django`)*

### 4. Apply Database Migrations

Run database migrations to initialize tables in SQLite:
```bash
python manage.py migrate
```

### 5. Create a Superuser (Optional)

Create an administrative account to access the Django Admin interface:
```bash
python manage.py createsuperuser
```
Follow the prompts to enter a username, email, and password.

---

## 🏃 Running the Application

Start the local Django development server:

```bash
python manage.py runserver
```

Once started, open your web browser and navigate to:
```text
http://127.0.0.1:8000/
```

To stop the development server, press `Ctrl + C` in your terminal.

---

## 🔗 URL Routes & API Endpoints

| URL Path | View Function | Method | Description |
| :--- | :--- | :--- | :--- |
| `/` | `views.task_list` | GET / POST | Main dashboard displaying all tasks and standard form submission. |
| `/tasks/add/` | `views.add_task_ajax` | POST | Asynchronous AJAX endpoint to create a new task. |
| `/tasks/<id>/toggle/` | `views.toggle_task` | POST | Toggles task completion status (`is_completed`). |
| `/tasks/<id>/delete/` | `views.delete_task` | POST | Asynchronously deletes a task from the database. |
| `/admin/` | Admin Site | GET / POST | Django built-in admin dashboard. |

---

## 🔒 Django Admin Access

1. Ensure you have created a superuser account (`python manage.py createsuperuser`).
2. Start the application (`python manage.py runserver`).
3. Visit `http://127.0.0.1:8000/admin/` in your browser.
4. Log in with your admin credentials to manage tasks, users, and permissions directly.

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve this project:
1. Fork the project repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git checkout -b feature/AmazingFeature`).
5. Open a Pull Request.

---

