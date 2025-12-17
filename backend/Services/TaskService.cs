using Microsoft.EntityFrameworkCore;
using DevTasker.API.Data;
using DevTasker.API.Models.DTOs;
using DevTasker.API.Models.Entities;
using DevTasker.API.Models.Requests;

namespace DevTasker.API.Services;

public class TaskService : ITaskService
{
    private readonly AppDbContext _context;

    public TaskService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<TaskDetailDto?> GetTaskByIdAsync(Guid taskId, Guid userId)
    {
        var task = await _context.Tasks
            .Include(t => t.Column).ThenInclude(c => c.Board).ThenInclude(b => b.Project).ThenInclude(p => p.Members)
            .Include(t => t.Assignee)
            .Include(t => t.TaskLabels).ThenInclude(tl => tl.Label)
            .Include(t => t.Comments).ThenInclude(c => c.User)
            .Include(t => t.ActivityLogs).ThenInclude(al => al.User)
            .FirstOrDefaultAsync(t => t.Id == taskId);

        if (task == null) return null;

        // Check access
        var project = task.Column.Board.Project;
        var hasAccess = project.OwnerId == userId || project.Members.Any(m => m.UserId == userId);
        if (!hasAccess) return null;

        return MapToTaskDetailDto(task);
    }

    public async Task<TaskDto> CreateTaskAsync(CreateTaskRequest request, Guid userId)
    {
        var column = await _context.Columns
            .Include(c => c.Board).ThenInclude(b => b.Project).ThenInclude(p => p.Members)
            .Include(c => c.Tasks)
            .FirstOrDefaultAsync(c => c.Id == request.ColumnId);

        if (column == null)
        {
            throw new InvalidOperationException("Column not found");
        }

        // Check access
        var project = column.Board.Project;
        var hasAccess = project.OwnerId == userId || project.Members.Any(m => m.UserId == userId);
        if (!hasAccess)
        {
            throw new UnauthorizedAccessException("No access to this project");
        }

        // Generate task key
        var taskCount = await _context.Tasks
            .CountAsync(t => t.Column.Board.ProjectId == project.Id);
        var taskKey = $"{project.Key}-{taskCount + 1}";

        var maxOrder = column.Tasks.Any() ? column.Tasks.Max(t => t.OrderIndex) : -1;

        var task = new TaskItem
        {
            ColumnId = request.ColumnId,
            Title = request.Title,
            Description = request.Description,
            Priority = request.Priority,
            AssigneeId = request.AssigneeId,
            DueDate = request.DueDate,
            StoryPoints = request.StoryPoints,
            TaskKey = taskKey,
            OrderIndex = maxOrder + 1
        };

        _context.Tasks.Add(task);

        // Add labels if provided
        if (request.LabelIds != null && request.LabelIds.Any())
        {
            foreach (var labelId in request.LabelIds)
            {
                _context.TaskLabels.Add(new TaskLabel { TaskId = task.Id, LabelId = labelId });
            }
        }

        // Log activity
        var activityLog = new ActivityLog
        {
            TaskId = task.Id,
            UserId = userId,
            Action = "Created",
            Details = $"Task \"{task.Title}\" was created"
        };
        _context.ActivityLogs.Add(activityLog);

        await _context.SaveChangesAsync();

        // Reload with relationships
        await _context.Entry(task).Reference(t => t.Assignee).LoadAsync();
        await _context.Entry(task).Collection(t => t.TaskLabels).LoadAsync();
        foreach (var tl in task.TaskLabels)
        {
            await _context.Entry(tl).Reference(x => x.Label).LoadAsync();
        }
        await _context.Entry(task).Collection(t => t.Comments).LoadAsync();

        return MapToTaskDto(task);
    }

    public async Task<TaskDto?> UpdateTaskAsync(Guid taskId, UpdateTaskRequest request, Guid userId)
    {
        var task = await _context.Tasks
            .Include(t => t.Column).ThenInclude(c => c.Board).ThenInclude(b => b.Project).ThenInclude(p => p.Members)
            .Include(t => t.Assignee)
            .Include(t => t.TaskLabels).ThenInclude(tl => tl.Label)
            .Include(t => t.Comments)
            .FirstOrDefaultAsync(t => t.Id == taskId);

        if (task == null) return null;

        // Check access
        var project = task.Column.Board.Project;
        var hasAccess = project.OwnerId == userId || project.Members.Any(m => m.UserId == userId);
        if (!hasAccess) return null;

        var changes = new List<string>();

        if (request.Title != null && request.Title != task.Title)
        {
            changes.Add($"Title changed from \"{task.Title}\" to \"{request.Title}\"");
            task.Title = request.Title;
        }
        if (request.Description != null)
        {
            task.Description = request.Description;
            changes.Add("Description updated");
        }
        if (request.Priority != null && request.Priority != task.Priority)
        {
            changes.Add($"Priority changed from {task.Priority} to {request.Priority}");
            task.Priority = request.Priority;
        }
        if (request.AssigneeId.HasValue || request.AssigneeId == null)
        {
            task.AssigneeId = request.AssigneeId;
        }
        if (request.DueDate.HasValue)
        {
            task.DueDate = request.DueDate;
        }
        if (request.StoryPoints.HasValue)
        {
            task.StoryPoints = request.StoryPoints;
        }

        // Update labels
        if (request.LabelIds != null)
        {
            var existingLabels = task.TaskLabels.ToList();
            _context.TaskLabels.RemoveRange(existingLabels);

            foreach (var labelId in request.LabelIds)
            {
                _context.TaskLabels.Add(new TaskLabel { TaskId = task.Id, LabelId = labelId });
            }
        }

        task.UpdatedAt = DateTime.UtcNow;

        // Log activity
        if (changes.Any())
        {
            var activityLog = new ActivityLog
            {
                TaskId = task.Id,
                UserId = userId,
                Action = "Updated",
                Details = string.Join("; ", changes)
            };
            _context.ActivityLogs.Add(activityLog);
        }

        await _context.SaveChangesAsync();

        // Reload labels
        await _context.Entry(task).Collection(t => t.TaskLabels).LoadAsync();
        foreach (var tl in task.TaskLabels)
        {
            await _context.Entry(tl).Reference(x => x.Label).LoadAsync();
        }
        await _context.Entry(task).Reference(t => t.Assignee).LoadAsync();

        return MapToTaskDto(task);
    }

    public async Task<TaskDto?> MoveTaskAsync(Guid taskId, MoveTaskRequest request, Guid userId)
    {
        var task = await _context.Tasks
            .Include(t => t.Column).ThenInclude(c => c.Board).ThenInclude(b => b.Project).ThenInclude(p => p.Members)
            .Include(t => t.Assignee)
            .Include(t => t.TaskLabels).ThenInclude(tl => tl.Label)
            .Include(t => t.Comments)
            .FirstOrDefaultAsync(t => t.Id == taskId);

        if (task == null) return null;

        // Check access
        var project = task.Column.Board.Project;
        var hasAccess = project.OwnerId == userId || project.Members.Any(m => m.UserId == userId);
        if (!hasAccess) return null;

        var sourceColumn = task.Column;
        var targetColumn = await _context.Columns
            .Include(c => c.Tasks)
            .FirstOrDefaultAsync(c => c.Id == request.ColumnId);

        if (targetColumn == null) return null;

        // Get the old column name for logging
        var oldColumnName = sourceColumn.Name;

        // Update tasks in source column (shift orders down)
        var tasksToShiftDown = await _context.Tasks
            .Where(t => t.ColumnId == sourceColumn.Id && t.OrderIndex > task.OrderIndex)
            .ToListAsync();
        foreach (var t in tasksToShiftDown)
        {
            t.OrderIndex--;
        }

        // Update tasks in target column (shift orders up to make room)
        var tasksToShiftUp = await _context.Tasks
            .Where(t => t.ColumnId == request.ColumnId && t.OrderIndex >= request.OrderIndex)
            .ToListAsync();
        foreach (var t in tasksToShiftUp)
        {
            t.OrderIndex++;
        }

        task.ColumnId = request.ColumnId;
        task.OrderIndex = request.OrderIndex;
        task.UpdatedAt = DateTime.UtcNow;

        // Log activity if column changed
        if (sourceColumn.Id != request.ColumnId)
        {
            var activityLog = new ActivityLog
            {
                TaskId = task.Id,
                UserId = userId,
                Action = "Moved",
                Details = $"Moved from \"{oldColumnName}\" to \"{targetColumn.Name}\""
            };
            _context.ActivityLogs.Add(activityLog);
        }

        await _context.SaveChangesAsync();

        return MapToTaskDto(task);
    }

    public async Task<bool> DeleteTaskAsync(Guid taskId, Guid userId)
    {
        var task = await _context.Tasks
            .Include(t => t.Column).ThenInclude(c => c.Board).ThenInclude(b => b.Project).ThenInclude(p => p.Members)
            .FirstOrDefaultAsync(t => t.Id == taskId);

        if (task == null) return false;

        // Check access - only owner, admin, or PM can delete tasks
        var project = task.Column.Board.Project;
        var canDelete = project.OwnerId == userId ||
            project.Members.Any(m => m.UserId == userId && (m.Role == "Admin" || m.Role == "ProjectManager"));
        if (!canDelete) return false;

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<CommentDto> AddCommentAsync(Guid taskId, CreateCommentRequest request, Guid userId)
    {
        var task = await _context.Tasks
            .Include(t => t.Column).ThenInclude(c => c.Board).ThenInclude(b => b.Project).ThenInclude(p => p.Members)
            .FirstOrDefaultAsync(t => t.Id == taskId);

        if (task == null)
        {
            throw new InvalidOperationException("Task not found");
        }

        // Check access
        var project = task.Column.Board.Project;
        var hasAccess = project.OwnerId == userId || project.Members.Any(m => m.UserId == userId);
        if (!hasAccess)
        {
            throw new UnauthorizedAccessException("No access to this project");
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        var comment = new Comment
        {
            TaskId = taskId,
            UserId = userId,
            Content = request.Content
        };

        _context.Comments.Add(comment);

        // Log activity
        var activityLog = new ActivityLog
        {
            TaskId = taskId,
            UserId = userId,
            Action = "Commented",
            Details = request.Content.Length > 50 ? request.Content.Substring(0, 50) + "..." : request.Content
        };
        _context.ActivityLogs.Add(activityLog);

        await _context.SaveChangesAsync();

        return new CommentDto(
            comment.Id,
            comment.Content,
            new UserDto(
                user.Id,
                user.Email!,
                user.FirstName,
                user.LastName,
                user.Role,
                user.AvatarUrl,
                user.CreatedAt
            ),
            comment.CreatedAt,
            comment.UpdatedAt
        );
    }

    public async Task<bool> DeleteCommentAsync(Guid commentId, Guid userId)
    {
        var comment = await _context.Comments
            .Include(c => c.Task).ThenInclude(t => t.Column).ThenInclude(c => c.Board).ThenInclude(b => b.Project).ThenInclude(p => p.Members)
            .FirstOrDefaultAsync(c => c.Id == commentId);

        if (comment == null) return false;

        // Only the comment author or admins can delete
        var project = comment.Task.Column.Board.Project;
        var canDelete = comment.UserId == userId || project.OwnerId == userId ||
            project.Members.Any(m => m.UserId == userId && m.Role == "Admin");
        if (!canDelete) return false;

        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<ActivityLogDto>> GetTaskActivityAsync(Guid taskId, Guid userId)
    {
        var task = await _context.Tasks
            .Include(t => t.Column).ThenInclude(c => c.Board).ThenInclude(b => b.Project).ThenInclude(p => p.Members)
            .FirstOrDefaultAsync(t => t.Id == taskId);

        if (task == null) return new List<ActivityLogDto>();

        // Check access
        var project = task.Column.Board.Project;
        var hasAccess = project.OwnerId == userId || project.Members.Any(m => m.UserId == userId);
        if (!hasAccess) return new List<ActivityLogDto>();

        var logs = await _context.ActivityLogs
            .Include(al => al.User)
            .Where(al => al.TaskId == taskId)
            .OrderByDescending(al => al.CreatedAt)
            .Take(50)
            .ToListAsync();

        return logs.Select(al => new ActivityLogDto(
            al.Id,
            al.Action,
            al.Details,
            new UserDto(
                al.User.Id,
                al.User.Email!,
                al.User.FirstName,
                al.User.LastName,
                al.User.Role,
                al.User.AvatarUrl,
                al.User.CreatedAt
            ),
            al.CreatedAt
        )).ToList();
    }

    private TaskDto MapToTaskDto(TaskItem task)
    {
        return new TaskDto(
            task.Id,
            task.TaskKey,
            task.Title,
            task.Description,
            task.Priority,
            task.OrderIndex,
            task.DueDate,
            task.StoryPoints,
            task.CreatedAt,
            task.Assignee != null ? new UserDto(
                task.Assignee.Id,
                task.Assignee.Email!,
                task.Assignee.FirstName,
                task.Assignee.LastName,
                task.Assignee.Role,
                task.Assignee.AvatarUrl,
                task.Assignee.CreatedAt
            ) : null,
            task.TaskLabels.Select(tl => new LabelDto(tl.Label.Id, tl.Label.Name, tl.Label.Color)).ToList(),
            task.Comments.Count
        );
    }

    private TaskDetailDto MapToTaskDetailDto(TaskItem task)
    {
        return new TaskDetailDto(
            task.Id,
            task.ColumnId,
            task.Column.Name,
            task.TaskKey,
            task.Title,
            task.Description,
            task.Priority,
            task.OrderIndex,
            task.DueDate,
            task.StoryPoints,
            task.CreatedAt,
            task.UpdatedAt,
            task.Assignee != null ? new UserDto(
                task.Assignee.Id,
                task.Assignee.Email!,
                task.Assignee.FirstName,
                task.Assignee.LastName,
                task.Assignee.Role,
                task.Assignee.AvatarUrl,
                task.Assignee.CreatedAt
            ) : null,
            task.TaskLabels.Select(tl => new LabelDto(tl.Label.Id, tl.Label.Name, tl.Label.Color)).ToList(),
            task.Comments.OrderByDescending(c => c.CreatedAt).Select(c => new CommentDto(
                c.Id,
                c.Content,
                new UserDto(
                    c.User.Id,
                    c.User.Email!,
                    c.User.FirstName,
                    c.User.LastName,
                    c.User.Role,
                    c.User.AvatarUrl,
                    c.User.CreatedAt
                ),
                c.CreatedAt,
                c.UpdatedAt
            )).ToList(),
            task.ActivityLogs.OrderByDescending(al => al.CreatedAt).Take(20).Select(al => new ActivityLogDto(
                al.Id,
                al.Action,
                al.Details,
                new UserDto(
                    al.User.Id,
                    al.User.Email!,
                    al.User.FirstName,
                    al.User.LastName,
                    al.User.Role,
                    al.User.AvatarUrl,
                    al.User.CreatedAt
                ),
                al.CreatedAt
            )).ToList()
        );
    }
}
