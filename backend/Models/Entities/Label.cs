namespace DevTasker.API.Models.Entities;

public class Label
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProjectId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = "#6366f1"; // Default indigo

    // Navigation properties
    public virtual Project Project { get; set; } = null!;
    public virtual ICollection<TaskLabel> TaskLabels { get; set; } = new List<TaskLabel>();
}
