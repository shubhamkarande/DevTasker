using System.ComponentModel.DataAnnotations;

namespace DevTasker.API.Models.Requests;

public class CreateProjectRequest
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [Required]
    [MaxLength(10)]
    [RegularExpression("^[A-Z]+$", ErrorMessage = "Key must be uppercase letters only")]
    public string Key { get; set; } = string.Empty;
}

public class UpdateProjectRequest
{
    [MaxLength(100)]
    public string? Name { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }
}

public class AddProjectMemberRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Role { get; set; } = "TeamMember";
}

public class UpdateProjectMemberRequest
{
    [Required]
    public string Role { get; set; } = string.Empty;
}

public class CreateLabelRequest
{
    [Required]
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [RegularExpression("^#[0-9A-Fa-f]{6}$", ErrorMessage = "Color must be a valid hex color")]
    public string Color { get; set; } = "#6366f1";
}
