from django.db import models
from django.utils import timezone
from django.utils.dateparse import parse_date

class Task(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    due_date = models.DateField(blank=True, null=True)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    @property
    def is_overdue(self):
        if not self.due_date or self.is_completed:
            return False
        d = self.due_date
        if isinstance(d, str):
            d = parse_date(d)
        if d:
            return d < timezone.now().date()
        return False
