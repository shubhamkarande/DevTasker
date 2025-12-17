namespace DevTasker.API.Models.Entities;

public class Comment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TaskId { get; set; }
    public Guid UserId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public virtual TaskItem Task { get; set; } = null!;
    public virtual ApplicationUser User { get; set; } = null!;
}
