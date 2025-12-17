using DevTasker.API.Models.DTOs;
using DevTasker.API.Models.Requests;

namespace DevTasker.API.Services;

public interface IProjectService
{
    Task<List<ProjectDto>> GetUserProjectsAsync(Guid userId);
    Task<ProjectDetailDto?> GetProjectByIdAsync(Guid projectId, Guid userId);
    Task<ProjectDto> CreateProjectAsync(CreateProjectRequest request, Guid ownerId);
    Task<ProjectDto?> UpdateProjectAsync(Guid projectId, UpdateProjectRequest request, Guid userId);
    Task<bool> DeleteProjectAsync(Guid projectId, Guid userId);
    Task<ProjectMemberDto?> AddMemberAsync(Guid projectId, AddProjectMemberRequest request, Guid currentUserId);
    Task<bool> RemoveMemberAsync(Guid projectId, Guid memberId, Guid currentUserId);
    Task<bool> UpdateMemberRoleAsync(Guid projectId, Guid memberId, UpdateProjectMemberRequest request, Guid currentUserId);
    Task<LabelDto> CreateLabelAsync(Guid projectId, CreateLabelRequest request, Guid userId);
    Task<bool> DeleteLabelAsync(Guid projectId, Guid labelId, Guid userId);
}
