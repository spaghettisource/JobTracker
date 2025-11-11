using Microsoft.AspNetCore.Mvc;
using IdentityService.Services;

namespace IdentityService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly RedisCacheService _cache;

    public UsersController(RedisCacheService cache)
    {
        _cache = cache;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _cache.GetAllUsersAsync();
        return Ok(users);
    }
}
