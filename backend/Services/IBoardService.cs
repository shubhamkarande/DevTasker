using DevTasker.API.Models.DTOs;
using DevTasker.API.Models.Requests;

namespace DevTasker.API.Services;

public interface IBoardService
{
    Task<List<BoardSummaryDto>> GetProjectBoardsAsync(Guid projectId, Guid userId);
    Task<BoardDto?> GetBoardByIdAsync(Guid boardId, Guid userId);
    Task<BoardDto> CreateBoardAsync(CreateBoardRequest request, Guid userId);
    Task<BoardDto?> UpdateBoardAsync(Guid boardId, UpdateBoardRequest request, Guid userId);
    Task<bool> DeleteBoardAsync(Guid boardId, Guid userId);
    Task<ColumnDto> CreateColumnAsync(Guid boardId, CreateColumnRequest request, Guid userId);
    Task<ColumnDto?> UpdateColumnAsync(Guid columnId, UpdateColumnRequest request, Guid userId);
    Task<bool> ReorderColumnsAsync(Guid boardId, ReorderColumnsRequest request, Guid userId);
    Task<bool> DeleteColumnAsync(Guid columnId, Guid userId);
}
