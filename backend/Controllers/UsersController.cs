using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DevTasker.API.Data;
using DevTasker.API.Models.DTOs;
using DevTasker.API.Models.Entities;
using DevTasker.API.Models.Requests;

namespace DevTasker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AppDbContext _context;

    public UsersController(UserManager<ApplicationUser> userManager, AppDbContext context)
    {
        _userManager = userManager;
        _context = context;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<UserDto>>> GetAllUsers()
    {
        var users = await _userManager.Users.ToListAsync();
        return users.Select(u => new UserDto(
            u.Id,
            u.Email!,
            u.FirstName,
            u.LastName,
            u.Role,
            u.AvatarUrl,
            u.CreatedAt
        )).ToList();
    }

    [HttpGet("me")]
    public async Task<ActionResult<UserDetailDto>> GetCurrentUser()
    {
        var userId = GetCurrentUserId();
        var user = await _userManager.Users
            .Include(u => u.ProjectMemberships).ThenInclude(pm => pm.Project)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return NotFound();

        return new UserDetailDto(
            user.Id,
            user.Email!,
            user.FirstName,
            user.LastName,
            user.Role,
            user.AvatarUrl,
            user.CreatedAt,
            user.ProjectMemberships.Select(pm => new ProjectMembershipDto(
                pm.ProjectId,
                pm.Project.Name,
                pm.Role
            )).ToList()
        );
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetUser(Guid id)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user == null) return NotFound();

        return new UserDto(
            user.Id,
            user.Email!,
            user.FirstName,
            user.LastName,
            user.Role,
            user.AvatarUrl,
            user.CreatedAt
        );
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<UserDto>> UpdateUser(Guid id, [FromBody] UpdateUserRequest request)
    {
        var currentUserId = GetCurrentUserId();
        var currentUser = await _userManager.FindByIdAsync(currentUserId.ToString());

        // Only allow updating self or admin updating others
        if (id != currentUserId && currentUser?.Role != "Admin")
        {
            return Forbid();
        }

        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user == null) return NotFound();

        if (request.FirstName != null) user.FirstName = request.FirstName;
        if (request.LastName != null) user.LastName = request.LastName;
        if (request.AvatarUrl != null) user.AvatarUrl = request.AvatarUrl;
        user.UpdatedAt = DateTime.UtcNow;

        await _userManager.UpdateAsync(user);

        return new UserDto(
            user.Id,
            user.Email!,
            user.FirstName,
            user.LastName,
            user.Role,
            user.AvatarUrl,
            user.CreatedAt
        );
    }

    [HttpPut("{id}/role")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserDto>> UpdateUserRole(Guid id, [FromBody] UpdateUserRoleRequest request)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user == null) return NotFound();

        var validRoles = new[] { "Admin", "ProjectManager", "TeamMember" };
        if (!validRoles.Contains(request.Role))
        {
            return BadRequest(new { message = "Invalid role" });
        }

        user.Role = request.Role;
        user.UpdatedAt = DateTime.UtcNow;

        await _userManager.UpdateAsync(user);

        return new UserDto(
            user.Id,
            user.Email!,
            user.FirstName,
            user.LastName,
            user.Role,
            user.AvatarUrl,
            user.CreatedAt
        );
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user == null) return NotFound();

        await _userManager.DeleteAsync(user);
        return NoContent();
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }
}
