using System.ComponentModel.DataAnnotations;

namespace DevTasker.API.Models.Requests;

public class CreateBoardRequest
{
    [Required]
    public Guid ProjectId { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    public bool CreateDefaultColumns { get; set; } = true;
}

public class UpdateBoardRequest
{
    [MaxLength(100)]
    public string? Name { get; set; }
}

public class CreateColumnRequest
{
    [Required]
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    public string? Color { get; set; }
}

public class UpdateColumnRequest
{
    [MaxLength(50)]
    public string? Name { get; set; }

    public string? Color { get; set; }
}

public class ReorderColumnsRequest
{
    [Required]
    public List<Guid> ColumnIds { get; set; } = new();
}

public class CreateTaskRequest
{
    [Required]
    public Guid ColumnId { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(5000)]
    public string? Description { get; set; }

    public string Priority { get; set; } = "Medium";

    public Guid? AssigneeId { get; set; }

    public DateTime? DueDate { get; set; }

    public int? StoryPoints { get; set; }

    public List<Guid>? LabelIds { get; set; }
}

public class UpdateTaskRequest
{
    [MaxLength(200)]
    public string? Title { get; set; }

    [MaxLength(5000)]
    public string? Description { get; set; }

    public string? Priority { get; set; }

    public Guid? AssigneeId { get; set; }

    public DateTime? DueDate { get; set; }

    public int? StoryPoints { get; set; }

    public List<Guid>? LabelIds { get; set; }
}

public class MoveTaskRequest
{
    [Required]
    public Guid ColumnId { get; set; }

    [Required]
    public int OrderIndex { get; set; }
}

public class CreateCommentRequest
{
    [Required]
    [MaxLength(2000)]
    public string Content { get; set; } = string.Empty;
}
