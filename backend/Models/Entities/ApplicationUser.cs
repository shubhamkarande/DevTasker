using Microsoft.AspNetCore.Identity;

namespace DevTasker.API.Models.Entities;

public class ApplicationUser : IdentityUser<Guid>
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Role { get; set; } = "TeamMember"; // Admin, ProjectManager, TeamMember
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? AvatarUrl { get; set; }

    // Navigation properties
    public virtual ICollection<Project> OwnedProjects { get; set; } = new List<Project>();
    public virtual ICollection<ProjectMember> ProjectMemberships { get; set; } = new List<ProjectMember>();
    public virtual ICollection<TaskItem> AssignedTasks { get; set; } = new List<TaskItem>();
    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public virtual ICollection<ActivityLog> ActivityLogs { get; set; } = new List<ActivityLog>();
}
