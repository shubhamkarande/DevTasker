namespace DevTasker.API.Models.Entities;

public class Board
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProjectId { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public virtual Project Project { get; set; } = null!;
    public virtual ICollection<Column> Columns { get; set; } = new List<Column>();
}
