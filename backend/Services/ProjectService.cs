using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using DevTasker.API.Data;
using DevTasker.API.Models.DTOs;
using DevTasker.API.Models.Entities;
using DevTasker.API.Models.Requests;

namespace DevTasker.API.Services;

public class ProjectService : IProjectService
{
    private readonly AppDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public ProjectService(AppDbContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public async Task<List<ProjectDto>> GetUserProjectsAsync(Guid userId)
    {
        var projects = await _context.Projects
            .Include(p => p.Owner)
            .Include(p => p.Members)
            .Include(p => p.Boards)
            .Where(p => p.OwnerId == userId || p.Members.Any(m => m.UserId == userId))
            .ToListAsync();

        return projects.Select(p => new ProjectDto(
            p.Id,
            p.Name,
            p.Description,
            p.Key,
            p.OwnerId,
            $"{p.Owner.FirstName} {p.Owner.LastName}",
            p.CreatedAt,
            p.Boards.Count,
            p.Members.Count + 1 // +1 for owner
        )).ToList();
    }

    public async Task<ProjectDetailDto?> GetProjectByIdAsync(Guid projectId, Guid userId)
    {
        var project = await _context.Projects
            .Include(p => p.Owner)
            .Include(p => p.Members).ThenInclude(m => m.User)
            .Include(p => p.Boards).ThenInclude(b => b.Columns).ThenInclude(c => c.Tasks)
            .Include(p => p.Labels)
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project == null) return null;

        // Check if user has access
        var hasAccess = project.OwnerId == userId || project.Members.Any(m => m.UserId == userId);
        if (!hasAccess) return null;

        return new ProjectDetailDto(
            project.Id,
            project.Name,
            project.Description,
            project.Key,
            project.OwnerId,
            $"{project.Owner.FirstName} {project.Owner.LastName}",
            project.CreatedAt,
            project.Boards.Select(b => new BoardSummaryDto(
                b.Id,
                b.Name,
                b.Columns.SelectMany(c => c.Tasks).Count(),
                b.CreatedAt
            )).ToList(),
            project.Members.Select(m => new ProjectMemberDto(
                m.Id,
                m.UserId,
                m.User.Email!,
                m.User.FirstName,
                m.User.LastName,
                m.Role,
                m.User.AvatarUrl
            )).ToList(),
            project.Labels.Select(l => new LabelDto(l.Id, l.Name, l.Color)).ToList()
        );
    }

    public async Task<ProjectDto> CreateProjectAsync(CreateProjectRequest request, Guid ownerId)
    {
        // Check if key is unique
        var keyExists = await _context.Projects.AnyAsync(p => p.Key == request.Key);
        if (keyExists)
        {
            throw new InvalidOperationException("Project key already exists");
        }

        var owner = await _userManager.FindByIdAsync(ownerId.ToString());
        if (owner == null)
        {
            throw new InvalidOperationException("User not found");
        }

        var project = new Project
        {
            Name = request.Name,
            Description = request.Description,
            Key = request.Key,
            OwnerId = ownerId
        };

        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

        return new ProjectDto(
            project.Id,
            project.Name,
            project.Description,
            project.Key,
            project.OwnerId,
            $"{owner.FirstName} {owner.LastName}",
            project.CreatedAt,
            0,
            1
        );
    }

    public async Task<ProjectDto?> UpdateProjectAsync(Guid projectId, UpdateProjectRequest request, Guid userId)
    {
        var project = await _context.Projects
            .Include(p => p.Owner)
            .Include(p => p.Members)
            .Include(p => p.Boards)
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project == null) return null;

        // Only owner or admin can update
        var canUpdate = project.OwnerId == userId || 
            project.Members.Any(m => m.UserId == userId && (m.Role == "Admin" || m.Role == "ProjectManager"));
        if (!canUpdate) return null;

        if (request.Name != null) project.Name = request.Name;
        if (request.Description != null) project.Description = request.Description;
        project.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new ProjectDto(
            project.Id,
            project.Name,
            project.Description,
            project.Key,
            project.OwnerId,
            $"{project.Owner.FirstName} {project.Owner.LastName}",
            project.CreatedAt,
            project.Boards.Count,
            project.Members.Count + 1
        );
    }

    public async Task<bool> DeleteProjectAsync(Guid projectId, Guid userId)
    {
        var project = await _context.Projects
            .Include(p => p.Members)
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project == null) return false;

        // Only owner can delete
        if (project.OwnerId != userId) return false;

        _context.Projects.Remove(project);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<ProjectMemberDto?> AddMemberAsync(Guid projectId, AddProjectMemberRequest request, Guid currentUserId)
    {
        var project = await _context.Projects
            .Include(p => p.Members)
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project == null) return null;

        // Only owner or admin/PM can add members
        var canAdd = project.OwnerId == currentUserId ||
            project.Members.Any(m => m.UserId == currentUserId && (m.Role == "Admin" || m.Role == "ProjectManager"));
        if (!canAdd) return null;

        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        // Check if already a member
        if (project.Members.Any(m => m.UserId == user.Id) || project.OwnerId == user.Id)
        {
            throw new InvalidOperationException("User is already a member of this project");
        }

        var member = new ProjectMember
        {
            ProjectId = projectId,
            UserId = user.Id,
            Role = request.Role
        };

        _context.ProjectMembers.Add(member);
        await _context.SaveChangesAsync();

        return new ProjectMemberDto(
            member.Id,
            user.Id,
            user.Email!,
            user.FirstName,
            user.LastName,
            member.Role,
            user.AvatarUrl
        );
    }

    public async Task<bool> RemoveMemberAsync(Guid projectId, Guid memberId, Guid currentUserId)
    {
        var project = await _context.Projects
            .Include(p => p.Members)
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project == null) return false;

        var member = project.Members.FirstOrDefault(m => m.Id == memberId);
        if (member == null) return false;

        // Only owner or admin/PM can remove members (or member can remove themselves)
        var canRemove = project.OwnerId == currentUserId || member.UserId == currentUserId ||
            project.Members.Any(m => m.UserId == currentUserId && (m.Role == "Admin" || m.Role == "ProjectManager"));
        if (!canRemove) return false;

        _context.ProjectMembers.Remove(member);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateMemberRoleAsync(Guid projectId, Guid memberId, UpdateProjectMemberRequest request, Guid currentUserId)
    {
        var project = await _context.Projects
            .Include(p => p.Members)
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project == null) return false;

        var member = project.Members.FirstOrDefault(m => m.Id == memberId);
        if (member == null) return false;

        // Only owner can change roles
        if (project.OwnerId != currentUserId) return false;

        member.Role = request.Role;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<LabelDto> CreateLabelAsync(Guid projectId, CreateLabelRequest request, Guid userId)
    {
        var project = await _context.Projects
            .Include(p => p.Members)
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project == null)
        {
            throw new InvalidOperationException("Project not found");
        }

        // Check access
        var hasAccess = project.OwnerId == userId || project.Members.Any(m => m.UserId == userId);
        if (!hasAccess)
        {
            throw new UnauthorizedAccessException("No access to this project");
        }

        var label = new Label
        {
            ProjectId = projectId,
            Name = request.Name,
            Color = request.Color
        };

        _context.Labels.Add(label);
        await _context.SaveChangesAsync();

        return new LabelDto(label.Id, label.Name, label.Color);
    }

    public async Task<bool> DeleteLabelAsync(Guid projectId, Guid labelId, Guid userId)
    {
        var project = await _context.Projects
            .Include(p => p.Members)
            .Include(p => p.Labels)
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project == null) return false;

        // Only owner or admin/PM can delete labels
        var canDelete = project.OwnerId == userId ||
            project.Members.Any(m => m.UserId == userId && (m.Role == "Admin" || m.Role == "ProjectManager"));
        if (!canDelete) return false;

        var label = project.Labels.FirstOrDefault(l => l.Id == labelId);
        if (label == null) return false;

        _context.Labels.Remove(label);
        await _context.SaveChangesAsync();
        return true;
    }
}
