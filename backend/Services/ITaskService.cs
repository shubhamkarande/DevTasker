using DevTasker.API.Models.DTOs;
using DevTasker.API.Models.Requests;

namespace DevTasker.API.Services;

public interface ITaskService
{
    Task<TaskDetailDto?> GetTaskByIdAsync(Guid taskId, Guid userId);
    Task<TaskDto> CreateTaskAsync(CreateTaskRequest request, Guid userId);
    Task<TaskDto?> UpdateTaskAsync(Guid taskId, UpdateTaskRequest request, Guid userId);
    Task<TaskDto?> MoveTaskAsync(Guid taskId, MoveTaskRequest request, Guid userId);
    Task<bool> DeleteTaskAsync(Guid taskId, Guid userId);
    Task<CommentDto> AddCommentAsync(Guid taskId, CreateCommentRequest request, Guid userId);
    Task<bool> DeleteCommentAsync(Guid commentId, Guid userId);
    Task<List<ActivityLogDto>> GetTaskActivityAsync(Guid taskId, Guid userId);
}
