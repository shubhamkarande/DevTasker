using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using DevTasker.API.Models.DTOs;

namespace DevTasker.API.Hubs;

[Authorize]
public class BoardHub : Hub
{
    private static readonly Dictionary<string, HashSet<string>> _boardConnections = new();
    private static readonly Dictionary<string, UserPresenceInfo> _userPresence = new();

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userName = Context.User?.FindFirst(ClaimTypes.Name)?.Value ?? "Unknown";

        if (userId != null)
        {
            _userPresence[Context.ConnectionId] = new UserPresenceInfo
            {
                UserId = userId,
                UserName = userName,
                ConnectedAt = DateTime.UtcNow
            };
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        // Remove from all boards
        foreach (var board in _boardConnections)
        {
            if (board.Value.Contains(Context.ConnectionId))
            {
                board.Value.Remove(Context.ConnectionId);
                await Clients.Group(board.Key).SendAsync("UserLeft", userId);
            }
        }

        _userPresence.Remove(Context.ConnectionId);

        await base.OnDisconnectedAsync(exception);
    }

    public async Task JoinBoard(string boardId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, boardId);

        if (!_boardConnections.ContainsKey(boardId))
        {
            _boardConnections[boardId] = new HashSet<string>();
        }
        _boardConnections[boardId].Add(Context.ConnectionId);

        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userName = Context.User?.FindFirst(ClaimTypes.Name)?.Value ?? "Unknown";

        // Notify others that a user joined
        await Clients.OthersInGroup(boardId).SendAsync("UserJoined", new
        {
            UserId = userId,
            UserName = userName
        });

        // Send current users in board to the joining user
        var usersInBoard = _boardConnections[boardId]
            .Where(connId => _userPresence.ContainsKey(connId))
            .Select(connId => _userPresence[connId])
            .ToList();

        await Clients.Caller.SendAsync("CurrentUsers", usersInBoard);
    }

    public async Task LeaveBoard(string boardId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, boardId);

        if (_boardConnections.ContainsKey(boardId))
        {
            _boardConnections[boardId].Remove(Context.ConnectionId);
        }

        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        await Clients.OthersInGroup(boardId).SendAsync("UserLeft", userId);
    }

    // Called when a task is moved
    public async Task TaskMoved(string boardId, TaskMovedEvent taskEvent)
    {
        await Clients.OthersInGroup(boardId).SendAsync("TaskMoved", taskEvent);
    }

    // Called when a task is created
    public async Task TaskCreated(string boardId, TaskDto task)
    {
        await Clients.OthersInGroup(boardId).SendAsync("TaskCreated", task);
    }

    // Called when a task is updated
    public async Task TaskUpdated(string boardId, TaskDto task)
    {
        await Clients.OthersInGroup(boardId).SendAsync("TaskUpdated", task);
    }

    // Called when a task is deleted
    public async Task TaskDeleted(string boardId, string taskId)
    {
        await Clients.OthersInGroup(boardId).SendAsync("TaskDeleted", taskId);
    }

    // Called when a column is added
    public async Task ColumnCreated(string boardId, ColumnDto column)
    {
        await Clients.OthersInGroup(boardId).SendAsync("ColumnCreated", column);
    }

    // Called when a column is updated
    public async Task ColumnUpdated(string boardId, ColumnDto column)
    {
        await Clients.OthersInGroup(boardId).SendAsync("ColumnUpdated", column);
    }

    // Called when columns are reordered
    public async Task ColumnsReordered(string boardId, List<Guid> columnIds)
    {
        await Clients.OthersInGroup(boardId).SendAsync("ColumnsReordered", columnIds);
    }

    // Called when a column is deleted
    public async Task ColumnDeleted(string boardId, string columnId)
    {
        await Clients.OthersInGroup(boardId).SendAsync("ColumnDeleted", columnId);
    }
}

public class UserPresenceInfo
{
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public DateTime ConnectedAt { get; set; }
}

public class TaskMovedEvent
{
    public Guid TaskId { get; set; }
    public Guid SourceColumnId { get; set; }
    public Guid TargetColumnId { get; set; }
    public int NewOrderIndex { get; set; }
}
