namespace DevTasker.API.Models.Entities;

public class Project
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Key { get; set; } = string.Empty; // e.g., "DEV", "TASK"
    public Guid OwnerId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public virtual ApplicationUser Owner { get; set; } = null!;
    public virtual ICollection<Board> Boards { get; set; } = new List<Board>();
    public virtual ICollection<ProjectMember> Members { get; set; } = new List<ProjectMember>();
    public virtual ICollection<Label> Labels { get; set; } = new List<Label>();
}
