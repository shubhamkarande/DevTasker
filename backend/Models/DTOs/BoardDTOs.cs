namespace DevTasker.API.Models.DTOs;

public record BoardDto(
    Guid Id,
    Guid ProjectId,
    string ProjectName,
    string ProjectKey,
    string Name,
    DateTime CreatedAt,
    List<ColumnDto> Columns
);

public record ColumnDto(
    Guid Id,
    string Name,
    int OrderIndex,
    string? Color,
    List<TaskDto> Tasks
);

public record TaskDto(
    Guid Id,
    string? TaskKey,
    string Title,
    string? Description,
    string Priority,
    int OrderIndex,
    DateTime? DueDate,
    int? StoryPoints,
    DateTime CreatedAt,
    UserDto? Assignee,
    List<LabelDto> Labels,
    int CommentCount
);

public record TaskDetailDto(
    Guid Id,
    Guid ColumnId,
    string ColumnName,
    string? TaskKey,
    string Title,
    string? Description,
    string Priority,
    int OrderIndex,
    DateTime? DueDate,
    int? StoryPoints,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    UserDto? Assignee,
    List<LabelDto> Labels,
    List<CommentDto> Comments,
    List<ActivityLogDto> ActivityLogs
);

public record CommentDto(
    Guid Id,
    string Content,
    UserDto User,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record ActivityLogDto(
    Guid Id,
    string Action,
    string? Details,
    UserDto User,
    DateTime CreatedAt
);
