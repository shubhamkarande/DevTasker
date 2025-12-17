using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using DevTasker.API.Data;
using DevTasker.API.Hubs;
using DevTasker.API.Models.Requests;
using DevTasker.API.Services;

namespace DevTasker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;
    private readonly IHubContext<BoardHub> _hubContext;
    private readonly AppDbContext _context;

    public TasksController(ITaskService taskService, IHubContext<BoardHub> hubContext, AppDbContext context)
    {
        _taskService = taskService;
        _hubContext = hubContext;
        _context = context;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTask(Guid id)
    {
        var userId = GetCurrentUserId();
        var task = await _taskService.GetTaskByIdAsync(id, userId);
        if (task == null) return NotFound();
        return Ok(task);
    }

    [HttpPost]
    public async Task<IActionResult> CreateTask([FromBody] CreateTaskRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var task = await _taskService.CreateTaskAsync(request, userId);

            // Get board ID for SignalR notification
            var column = await _context.Columns.FindAsync(request.ColumnId);
            if (column != null)
            {
                await _hubContext.Clients.Group(column.BoardId.ToString()).SendAsync("TaskCreated", task);
            }

            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(Guid id, [FromBody] UpdateTaskRequest request)
    {
        var userId = GetCurrentUserId();
        var task = await _taskService.UpdateTaskAsync(id, request, userId);
        if (task == null) return NotFound();

        // Get board ID for SignalR notification
        var taskEntity = await _context.Tasks
            .Include(t => t.Column)
            .FirstOrDefaultAsync(t => t.Id == id);
        if (taskEntity != null)
        {
            await _hubContext.Clients.Group(taskEntity.Column.BoardId.ToString()).SendAsync("TaskUpdated", task);
        }

        return Ok(task);
    }

    [HttpPut("{id}/move")]
    public async Task<IActionResult> MoveTask(Guid id, [FromBody] MoveTaskRequest request)
    {
        var userId = GetCurrentUserId();

        // Get source info before move
        var taskBefore = await _context.Tasks
            .Include(t => t.Column)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (taskBefore == null) return NotFound();

        var sourceColumnId = taskBefore.ColumnId;
        var boardId = taskBefore.Column.BoardId;

        var task = await _taskService.MoveTaskAsync(id, request, userId);
        if (task == null) return NotFound();

        // Notify clients about the move
        var moveEvent = new TaskMovedEvent
        {
            TaskId = id,
            SourceColumnId = sourceColumnId,
            TargetColumnId = request.ColumnId,
            NewOrderIndex = request.OrderIndex
        };

        await _hubContext.Clients.Group(boardId.ToString()).SendAsync("TaskMoved", moveEvent);

        return Ok(task);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(Guid id)
    {
        var userId = GetCurrentUserId();

        // Get board ID before deletion
        var task = await _context.Tasks
            .Include(t => t.Column)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task == null) return NotFound();

        var boardId = task.Column.BoardId;

        var deleted = await _taskService.DeleteTaskAsync(id, userId);
        if (!deleted) return NotFound();

        // Notify clients
        await _hubContext.Clients.Group(boardId.ToString()).SendAsync("TaskDeleted", id.ToString());

        return NoContent();
    }

    [HttpGet("{taskId}/comments")]
    public async Task<IActionResult> GetComments(Guid taskId)
    {
        var userId = GetCurrentUserId();
        var task = await _taskService.GetTaskByIdAsync(taskId, userId);
        if (task == null) return NotFound();
        return Ok(task.Comments);
    }

    [HttpPost("{taskId}/comments")]
    public async Task<IActionResult> AddComment(Guid taskId, [FromBody] CreateCommentRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var comment = await _taskService.AddCommentAsync(taskId, request, userId);
            return Ok(comment);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpDelete("comments/{commentId}")]
    public async Task<IActionResult> DeleteComment(Guid commentId)
    {
        var userId = GetCurrentUserId();
        var deleted = await _taskService.DeleteCommentAsync(commentId, userId);
        if (!deleted) return NotFound();
        return NoContent();
    }

    [HttpGet("{taskId}/activity")]
    public async Task<IActionResult> GetActivity(Guid taskId)
    {
        var userId = GetCurrentUserId();
        var activity = await _taskService.GetTaskActivityAsync(taskId, userId);
        return Ok(activity);
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }
}
