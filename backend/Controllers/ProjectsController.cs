using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DevTasker.API.Models.Requests;
using DevTasker.API.Services;

namespace DevTasker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    [HttpGet]
    public async Task<IActionResult> GetProjects()
    {
        var userId = GetCurrentUserId();
        var projects = await _projectService.GetUserProjectsAsync(userId);
        return Ok(projects);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProject(Guid id)
    {
        var userId = GetCurrentUserId();
        var project = await _projectService.GetProjectByIdAsync(id, userId);
        if (project == null) return NotFound();
        return Ok(project);
    }

    [HttpPost]
    public async Task<IActionResult> CreateProject([FromBody] CreateProjectRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var project = await _projectService.CreateProjectAsync(request, userId);
            return CreatedAtAction(nameof(GetProject), new { id = project.Id }, project);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProject(Guid id, [FromBody] UpdateProjectRequest request)
    {
        var userId = GetCurrentUserId();
        var project = await _projectService.UpdateProjectAsync(id, request, userId);
        if (project == null) return NotFound();
        return Ok(project);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProject(Guid id)
    {
        var userId = GetCurrentUserId();
        var deleted = await _projectService.DeleteProjectAsync(id, userId);
        if (!deleted) return NotFound();
        return NoContent();
    }

    [HttpPost("{id}/members")]
    public async Task<IActionResult> AddMember(Guid id, [FromBody] AddProjectMemberRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var member = await _projectService.AddMemberAsync(id, request, userId);
            if (member == null) return NotFound();
            return Ok(member);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{projectId}/members/{memberId}")]
    public async Task<IActionResult> RemoveMember(Guid projectId, Guid memberId)
    {
        var userId = GetCurrentUserId();
        var removed = await _projectService.RemoveMemberAsync(projectId, memberId, userId);
        if (!removed) return NotFound();
        return NoContent();
    }

    [HttpPut("{projectId}/members/{memberId}")]
    public async Task<IActionResult> UpdateMemberRole(Guid projectId, Guid memberId, [FromBody] UpdateProjectMemberRequest request)
    {
        var userId = GetCurrentUserId();
        var updated = await _projectService.UpdateMemberRoleAsync(projectId, memberId, request, userId);
        if (!updated) return NotFound();
        return NoContent();
    }

    [HttpPost("{id}/labels")]
    public async Task<IActionResult> CreateLabel(Guid id, [FromBody] CreateLabelRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var label = await _projectService.CreateLabelAsync(id, request, userId);
            return Ok(label);
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

    [HttpDelete("{projectId}/labels/{labelId}")]
    public async Task<IActionResult> DeleteLabel(Guid projectId, Guid labelId)
    {
        var userId = GetCurrentUserId();
        var deleted = await _projectService.DeleteLabelAsync(projectId, labelId, userId);
        if (!deleted) return NotFound();
        return NoContent();
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }
}
