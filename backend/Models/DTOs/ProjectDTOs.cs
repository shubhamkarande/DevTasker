namespace DevTasker.API.Models.DTOs;

public record ProjectDto(
    Guid Id,
    string Name,
    string? Description,
    string Key,
    Guid OwnerId,
    string OwnerName,
    DateTime CreatedAt,
    int BoardCount,
    int MemberCount
);

public record ProjectDetailDto(
    Guid Id,
    string Name,
    string? Description,
    string Key,
    Guid OwnerId,
    string OwnerName,
    DateTime CreatedAt,
    List<BoardSummaryDto> Boards,
    List<ProjectMemberDto> Members,
    List<LabelDto> Labels
);

public record BoardSummaryDto(
    Guid Id,
    string Name,
    int TaskCount,
    DateTime CreatedAt
);

public record ProjectMemberDto(
    Guid Id,
    Guid UserId,
    string Email,
    string FirstName,
    string LastName,
    string Role,
    string? AvatarUrl
);

public record LabelDto(
    Guid Id,
    string Name,
    string Color
);
