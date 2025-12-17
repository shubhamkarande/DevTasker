namespace DevTasker.API.Models.Entities;

public class Column
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid BoardId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public string? Color { get; set; } // Optional color for the column

    // Navigation properties
    public virtual Board Board { get; set; } = null!;
    public virtual ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
}
