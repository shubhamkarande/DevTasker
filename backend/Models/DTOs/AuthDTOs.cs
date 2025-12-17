namespace DevTasker.API.Models.DTOs;

public record AuthResponseDto(
    string Token,
    string RefreshToken,
    DateTime ExpiresAt,
    UserDto User
);
