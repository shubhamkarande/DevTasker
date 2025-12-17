namespace DevTasker.API.Models.Entities;

public class TaskLabel
{
    public Guid TaskId { get; set; }
    public Guid LabelId { get; set; }

    // Navigation properties
    public virtual TaskItem Task { get; set; } = null!;
    public virtual Label Label { get; set; } = null!;
}
