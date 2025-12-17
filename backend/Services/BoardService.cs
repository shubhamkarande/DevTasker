using Microsoft.EntityFrameworkCore;
using DevTasker.API.Data;
using DevTasker.API.Models.DTOs;
using DevTasker.API.Models.Entities;
using DevTasker.API.Models.Requests;

namespace DevTasker.API.Services;

public class BoardService : IBoardService
{
    private readonly AppDbContext _context;

    public BoardService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<BoardSummaryDto>> GetProjectBoardsAsync(Guid projectId, Guid userId)
    {
        var project = await _context.Projects
            .Include(p => p.Members)
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project == null) return new List<BoardSummaryDto>();

        // Check access
        var hasAccess = project.OwnerId == userId || project.Members.Any(m => m.UserId == userId);
        if (!hasAccess) return new List<BoardSummaryDto>();

        var boards = await _context.Boards
            .Include(b => b.Columns).ThenInclude(c => c.Tasks)
            .Where(b => b.ProjectId == projectId)
            .ToListAsync();

        return boards.Select(b => new BoardSummaryDto(
            b.Id,
            b.Name,
            b.Columns.SelectMany(c => c.Tasks).Count(),
            b.CreatedAt
        )).ToList();
    }

    public async Task<BoardDto?> GetBoardByIdAsync(Guid boardId, Guid userId)
    {
        var board = await _context.Boards
            .Include(b => b.Project).ThenInclude(p => p.Members)
            .Include(b => b.Columns.OrderBy(c => c.OrderIndex))
                .ThenInclude(c => c.Tasks.OrderBy(t => t.OrderIndex))
                    .ThenInclude(t => t.Assignee)
            .Include(b => b.Columns)
                .ThenInclude(c => c.Tasks)
                    .ThenInclude(t => t.TaskLabels)
                        .ThenInclude(tl => tl.Label)
            .Include(b => b.Columns)
                .ThenInclude(c => c.Tasks)
                    .ThenInclude(t => t.Comments)
            .FirstOrDefaultAsync(b => b.Id == boardId);

        if (board == null) return null;

        // Check access
        var hasAccess = board.Project.OwnerId == userId || board.Project.Members.Any(m => m.UserId == userId);
        if (!hasAccess) return null;

        return new BoardDto(
            board.Id,
            board.ProjectId,
            board.Project.Name,
            board.Project.Key,
            board.Name,
            board.CreatedAt,
            board.Columns.OrderBy(c => c.OrderIndex).Select(c => new ColumnDto(
                c.Id,
                c.Name,
                c.OrderIndex,
                c.Color,
                c.Tasks.OrderBy(t => t.OrderIndex).Select(t => new TaskDto(
                    t.Id,
                    t.TaskKey,
                    t.Title,
                    t.Description,
                    t.Priority,
                    t.OrderIndex,
                    t.DueDate,
                    t.StoryPoints,
                    t.CreatedAt,
                    t.Assignee != null ? new UserDto(
                        t.Assignee.Id,
                        t.Assignee.Email!,
                        t.Assignee.FirstName,
                        t.Assignee.LastName,
                        t.Assignee.Role,
                        t.Assignee.AvatarUrl,
                        t.Assignee.CreatedAt
                    ) : null,
                    t.TaskLabels.Select(tl => new LabelDto(tl.Label.Id, tl.Label.Name, tl.Label.Color)).ToList(),
                    t.Comments.Count
                )).ToList()
            )).ToList()
        );
    }

    public async Task<BoardDto> CreateBoardAsync(CreateBoardRequest request, Guid userId)
    {
        var project = await _context.Projects
            .Include(p => p.Members)
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId);

        if (project == null)
        {
            throw new InvalidOperationException("Project not found");
        }

        // Check access - only owner or admin/PM can create boards
        var canCreate = project.OwnerId == userId ||
            project.Members.Any(m => m.UserId == userId && (m.Role == "Admin" || m.Role == "ProjectManager"));
        if (!canCreate)
        {
            throw new UnauthorizedAccessException("No permission to create boards in this project");
        }

        var board = new Board
        {
            ProjectId = request.ProjectId,
            Name = request.Name
        };

        _context.Boards.Add(board);

        // Create default columns if requested
        if (request.CreateDefaultColumns)
        {
            var defaultColumns = new[]
            {
                new Column { BoardId = board.Id, Name = "Backlog", OrderIndex = 0, Color = "#6b7280" },
                new Column { BoardId = board.Id, Name = "Todo", OrderIndex = 1, Color = "#3b82f6" },
                new Column { BoardId = board.Id, Name = "In Progress", OrderIndex = 2, Color = "#f59e0b" },
                new Column { BoardId = board.Id, Name = "Review", OrderIndex = 3, Color = "#8b5cf6" },
                new Column { BoardId = board.Id, Name = "Done", OrderIndex = 4, Color = "#10b981" }
            };
            _context.Columns.AddRange(defaultColumns);
        }

        await _context.SaveChangesAsync();

        return await GetBoardByIdAsync(board.Id, userId) ?? throw new InvalidOperationException("Failed to retrieve created board");
    }

    public async Task<BoardDto?> UpdateBoardAsync(Guid boardId, UpdateBoardRequest request, Guid userId)
    {
        var board = await _context.Boards
            .Include(b => b.Project).ThenInclude(p => p.Members)
            .FirstOrDefaultAsync(b => b.Id == boardId);

        if (board == null) return null;

        // Check access
        var canUpdate = board.Project.OwnerId == userId ||
            board.Project.Members.Any(m => m.UserId == userId && (m.Role == "Admin" || m.Role == "ProjectManager"));
        if (!canUpdate) return null;

        if (request.Name != null) board.Name = request.Name;
        board.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return await GetBoardByIdAsync(boardId, userId);
    }

    public async Task<bool> DeleteBoardAsync(Guid boardId, Guid userId)
    {
        var board = await _context.Boards
            .Include(b => b.Project).ThenInclude(p => p.Members)
            .FirstOrDefaultAsync(b => b.Id == boardId);

        if (board == null) return false;

        // Check access - only owner or admin/PM can delete
        var canDelete = board.Project.OwnerId == userId ||
            board.Project.Members.Any(m => m.UserId == userId && (m.Role == "Admin" || m.Role == "ProjectManager"));
        if (!canDelete) return false;

        _context.Boards.Remove(board);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<ColumnDto> CreateColumnAsync(Guid boardId, CreateColumnRequest request, Guid userId)
    {
        var board = await _context.Boards
            .Include(b => b.Project).ThenInclude(p => p.Members)
            .Include(b => b.Columns)
            .FirstOrDefaultAsync(b => b.Id == boardId);

        if (board == null)
        {
            throw new InvalidOperationException("Board not found");
        }

        // Check access
        var canCreate = board.Project.OwnerId == userId ||
            board.Project.Members.Any(m => m.UserId == userId && (m.Role == "Admin" || m.Role == "ProjectManager"));
        if (!canCreate)
        {
            throw new UnauthorizedAccessException("No permission to add columns");
        }

        var maxOrder = board.Columns.Any() ? board.Columns.Max(c => c.OrderIndex) : -1;

        var column = new Column
        {
            BoardId = boardId,
            Name = request.Name,
            Color = request.Color,
            OrderIndex = maxOrder + 1
        };

        _context.Columns.Add(column);
        await _context.SaveChangesAsync();

        return new ColumnDto(column.Id, column.Name, column.OrderIndex, column.Color, new List<TaskDto>());
    }

    public async Task<ColumnDto?> UpdateColumnAsync(Guid columnId, UpdateColumnRequest request, Guid userId)
    {
        var column = await _context.Columns
            .Include(c => c.Board).ThenInclude(b => b.Project).ThenInclude(p => p.Members)
            .FirstOrDefaultAsync(c => c.Id == columnId);

        if (column == null) return null;

        // Check access
        var canUpdate = column.Board.Project.OwnerId == userId ||
            column.Board.Project.Members.Any(m => m.UserId == userId && (m.Role == "Admin" || m.Role == "ProjectManager"));
        if (!canUpdate) return null;

        if (request.Name != null) column.Name = request.Name;
        if (request.Color != null) column.Color = request.Color;

        await _context.SaveChangesAsync();

        return new ColumnDto(column.Id, column.Name, column.OrderIndex, column.Color, new List<TaskDto>());
    }

    public async Task<bool> ReorderColumnsAsync(Guid boardId, ReorderColumnsRequest request, Guid userId)
    {
        var board = await _context.Boards
            .Include(b => b.Project).ThenInclude(p => p.Members)
            .Include(b => b.Columns)
            .FirstOrDefaultAsync(b => b.Id == boardId);

        if (board == null) return false;

        // Check access
        var canReorder = board.Project.OwnerId == userId ||
            board.Project.Members.Any(m => m.UserId == userId && (m.Role == "Admin" || m.Role == "ProjectManager"));
        if (!canReorder) return false;

        for (int i = 0; i < request.ColumnIds.Count; i++)
        {
            var column = board.Columns.FirstOrDefault(c => c.Id == request.ColumnIds[i]);
            if (column != null)
            {
                column.OrderIndex = i;
            }
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteColumnAsync(Guid columnId, Guid userId)
    {
        var column = await _context.Columns
            .Include(c => c.Board).ThenInclude(b => b.Project).ThenInclude(p => p.Members)
            .FirstOrDefaultAsync(c => c.Id == columnId);

        if (column == null) return false;

        // Check access
        var canDelete = column.Board.Project.OwnerId == userId ||
            column.Board.Project.Members.Any(m => m.UserId == userId && (m.Role == "Admin" || m.Role == "ProjectManager"));
        if (!canDelete) return false;

        _context.Columns.Remove(column);
        await _context.SaveChangesAsync();
        return true;
    }
}
