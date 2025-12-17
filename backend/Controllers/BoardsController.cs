using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using DevTasker.API.Hubs;
using DevTasker.API.Models.Requests;
using DevTasker.API.Services;

namespace DevTasker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BoardsController : ControllerBase
{
    private readonly IBoardService _boardService;
    private readonly IHubContext<BoardHub> _hubContext;

    public BoardsController(IBoardService boardService, IHubContext<BoardHub> hubContext)
    {
        _boardService = boardService;
        _hubContext = hubContext;
    }

    [HttpGet("project/{projectId}")]
    public async Task<IActionResult> GetProjectBoards(Guid projectId)
    {
        var userId = GetCurrentUserId();
        var boards = await _boardService.GetProjectBoardsAsync(projectId, userId);
        return Ok(boards);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetBoard(Guid id)
    {
        var userId = GetCurrentUserId();
        var board = await _boardService.GetBoardByIdAsync(id, userId);
        if (board == null) return NotFound();
        return Ok(board);
    }

    [HttpPost]
    public async Task<IActionResult> CreateBoard([FromBody] CreateBoardRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var board = await _boardService.CreateBoardAsync(request, userId);
            return CreatedAtAction(nameof(GetBoard), new { id = board.Id }, board);
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
    public async Task<IActionResult> UpdateBoard(Guid id, [FromBody] UpdateBoardRequest request)
    {
        var userId = GetCurrentUserId();
        var board = await _boardService.UpdateBoardAsync(id, request, userId);
        if (board == null) return NotFound();
        return Ok(board);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBoard(Guid id)
    {
        var userId = GetCurrentUserId();
        var deleted = await _boardService.DeleteBoardAsync(id, userId);
        if (!deleted) return NotFound();
        return NoContent();
    }

    [HttpPost("{boardId}/columns")]
    public async Task<IActionResult> CreateColumn(Guid boardId, [FromBody] CreateColumnRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var column = await _boardService.CreateColumnAsync(boardId, request, userId);

            // Notify other clients
            await _hubContext.Clients.Group(boardId.ToString()).SendAsync("ColumnCreated", column);

            return Ok(column);
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

    [HttpPut("columns/{columnId}")]
    public async Task<IActionResult> UpdateColumn(Guid columnId, [FromBody] UpdateColumnRequest request)
    {
        var userId = GetCurrentUserId();
        var column = await _boardService.UpdateColumnAsync(columnId, request, userId);
        if (column == null) return NotFound();

        // Would need to get boardId from column to notify clients
        return Ok(column);
    }

    [HttpPut("{boardId}/columns/reorder")]
    public async Task<IActionResult> ReorderColumns(Guid boardId, [FromBody] ReorderColumnsRequest request)
    {
        var userId = GetCurrentUserId();
        var success = await _boardService.ReorderColumnsAsync(boardId, request, userId);
        if (!success) return NotFound();

        // Notify other clients
        await _hubContext.Clients.Group(boardId.ToString()).SendAsync("ColumnsReordered", request.ColumnIds);

        return NoContent();
    }

    [HttpDelete("columns/{columnId}")]
    public async Task<IActionResult> DeleteColumn(Guid columnId)
    {
        var userId = GetCurrentUserId();
        var deleted = await _boardService.DeleteColumnAsync(columnId, userId);
        if (!deleted) return NotFound();
        return NoContent();
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }
}
