namespace DevTasker.API.Models.DTOs;

public record UserDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string Role,
    string? AvatarUrl,
    DateTime CreatedAt
);

public record UserDetailDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string Role,
    string? AvatarUrl,
    DateTime CreatedAt,
    List<ProjectMembershipDto> ProjectMemberships
);

public record ProjectMembershipDto(
    Guid ProjectId,
    string ProjectName,
    string Role
);
