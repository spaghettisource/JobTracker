using BCrypt.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using IdentityService.Contracts;
using IdentityService.Models;
using IdentityService.Services;

namespace IdentityService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly JwtTokenService _jwt;

    public AuthController(AppDbContext db, JwtTokenService jwt)
    {
        _db = db; _jwt = jwt;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest("Email and password are required.");

        var exists = await _db.Users.AnyAsync(u => u.Email == req.Email);
        if (exists) return Conflict("Email already registered.");

        var user = new User
        {
            Email = req.Email.Trim().ToLowerInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password)
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var token = _jwt.CreateToken(user.Id.ToString(), user.Email);
        return Ok(new AuthResponse(token));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var email = req.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.SingleOrDefaultAsync(u => u.Email == email);
        if (user is null) return Unauthorized("Invalid credentials.");

        var ok = BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash);
        if (!ok) return Unauthorized("Invalid credentials.");

        var token = _jwt.CreateToken(user.Id.ToString(), user.Email);
        return Ok(new AuthResponse(token));
    }
}
