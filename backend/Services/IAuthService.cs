using DevTasker.API.Models.DTOs;
using DevTasker.API.Models.Requests;

namespace DevTasker.API.Services;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterRequest request);
    Task<AuthResponseDto> LoginAsync(LoginRequest request);
    Task<AuthResponseDto> RefreshTokenAsync(string refreshToken);
    Task<bool> RevokeRefreshTokenAsync(Guid userId);
}
