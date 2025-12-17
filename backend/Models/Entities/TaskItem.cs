namespace DevTasker.API.Models.Entities;

public class TaskItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ColumnId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Priority { get; set; } = "Medium"; // Low, Medium, High, Critical
    public Guid? AssigneeId { get; set; }
    public DateTime? DueDate { get; set; }
    public int OrderIndex { get; set; }
    public string? TaskKey { get; set; } // e.g., "DEV-1", "TASK-42"
    public int? StoryPoints { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public virtual Column Column { get; set; } = null!;
    public virtual ApplicationUser? Assignee { get; set; }
    public virtual ICollection<TaskLabel> TaskLabels { get; set; } = new List<TaskLabel>();
    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public virtual ICollection<ActivityLog> ActivityLogs { get; set; } = new List<ActivityLog>();
}
