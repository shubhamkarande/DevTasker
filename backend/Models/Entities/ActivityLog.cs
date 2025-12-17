namespace DevTasker.API.Models.Entities;

public class ActivityLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TaskId { get; set; }
    public Guid UserId { get; set; }
    public string Action { get; set; } = string.Empty; // Created, Updated, Moved, Commented, etc.
    public string? Details { get; set; } // JSON or text describing the change
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual TaskItem Task { get; set; } = null!;
    public virtual ApplicationUser User { get; set; } = null!;
}
