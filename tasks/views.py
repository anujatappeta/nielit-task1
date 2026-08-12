import json
from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.dateparse import parse_date
from .models import Task

def _parse_due_date(val):
    if not val:
        return None
    if isinstance(val, str):
        val = val.strip()
        if not val:
            return None
        return parse_date(val)
    return val

def _format_due_date(d):
    if not d:
        return None
    if isinstance(d, str):
        d = parse_date(d)
    return d.strftime('%b %d, %Y') if d else None

@ensure_csrf_cookie
def task_list(request):
    """
    Renders the task list page and handles standard form submission.
    """
    if request.method == 'POST':
        title = request.POST.get('title', '').strip()
        description = request.POST.get('description', '').strip()
        due_date_raw = request.POST.get('due_date')

        if title:
            Task.objects.create(
                title=title,
                description=description,
                due_date=_parse_due_date(due_date_raw)
            )
            return redirect('task_list')

    tasks = Task.objects.all()
    completed_count = tasks.filter(is_completed=True).count()
    pending_count = tasks.filter(is_completed=False).count()

    context = {
        'tasks': tasks,
        'completed_count': completed_count,
        'pending_count': pending_count,
        'total_count': tasks.count(),
    }
    return render(request, 'tasks/task_list.html', context)


@require_POST
def add_task_ajax(request):
    """
    AJAX endpoint for adding a task asynchronously.
    """
    try:
        if request.content_type == 'application/json':
            data = json.loads(request.body)
            title = data.get('title', '').strip()
            description = data.get('description', '').strip()
            due_date_raw = data.get('due_date')
        else:
            title = request.POST.get('title', '').strip()
            description = request.POST.get('description', '').strip()
            due_date_raw = request.POST.get('due_date')

        if not title:
            return JsonResponse({'success': False, 'error': 'Title is required.'}, status=400)

        due_date = _parse_due_date(due_date_raw)

        task = Task.objects.create(
            title=title,
            description=description,
            due_date=due_date
        )

        return JsonResponse({
            'success': True,
            'task': {
                'id': task.id,
                'title': task.title,
                'description': task.description or '',
                'due_date': due_date.strftime('%Y-%m-%d') if due_date else None,
                'formatted_due_date': _format_due_date(due_date),
                'is_completed': task.is_completed,
                'is_overdue': task.is_overdue,
            }
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@require_POST
def toggle_task(request, task_id):
    """
    AJAX endpoint to mark a task as complete/incomplete without page reload.
    """
    task = get_object_or_404(Task, id=task_id)
    
    if request.body:
        try:
            data = json.loads(request.body)
            if 'is_completed' in data:
                task.is_completed = bool(data['is_completed'])
            else:
                task.is_completed = not task.is_completed
        except json.JSONDecodeError:
            task.is_completed = not task.is_completed
    else:
        task.is_completed = not task.is_completed

    task.save()

    return JsonResponse({
        'success': True,
        'task_id': task.id,
        'is_completed': task.is_completed,
        'title': task.title,
        'formatted_due_date': _format_due_date(task.due_date),
        'is_overdue': task.is_overdue,
    })


@require_POST
def delete_task(request, task_id):
    """
    AJAX endpoint to delete a task without page reload.
    """
    task = get_object_or_404(Task, id=task_id)
    task_id_saved = task.id
    task.delete()

    return JsonResponse({
        'success': True,
        'task_id': task_id_saved
    })
