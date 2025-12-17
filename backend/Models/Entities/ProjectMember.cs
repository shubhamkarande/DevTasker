namespace DevTasker.API.Models.Entities;

public class ProjectMember
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProjectId { get; set; }
    public Guid UserId { get; set; }
    public string Role { get; set; } = "TeamMember"; // Admin, ProjectManager, TeamMember
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual Project Project { get; set; } = null!;
    public virtual ApplicationUser User { get; set; } = null!;
}
