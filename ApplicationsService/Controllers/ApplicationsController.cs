using ApplicationsService.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.JsonWebTokens;

namespace ApplicationsService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ApplicationsController(AppDbContext db) : ControllerBase
{
    int CurrentUserId()
    {
        var subClaim =
            User.Claims.FirstOrDefault(c =>
                c.Type == System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub ||
                c.Type.EndsWith("nameidentifier", StringComparison.OrdinalIgnoreCase));

        if (subClaim == null)
            throw new UnauthorizedAccessException("Missing sub claim in token.");

        return int.Parse(subClaim.Value);
    }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var uid = CurrentUserId();
        var q = db.Applications.Where(a => a.UserId == uid).OrderByDescending(a => a.UpdatedAt);
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        return Ok(items);
    }

    public record CreateReq(string Position, string Company, string? Link, string? Notes);

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateReq req)
    {
        var app = new Application
        {
            Position = req.Position,
            Company = req.Company,
            Link = req.Link,
            Notes = req.Notes,
            UserId = CurrentUserId()
        };
        db.Applications.Add(app);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = app.Id }, app);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var uid = CurrentUserId();
        var appItem = await db.Applications.FirstOrDefaultAsync(a => a.Id == id && a.UserId == uid);
        return appItem is null ? NotFound() : Ok(appItem);
    }

    public record StatusReq(ApplicationStatus Status);
    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] StatusReq req)
    {
        var uid = CurrentUserId();
        var appItem = await db.Applications.FirstOrDefaultAsync(a => a.Id == id && a.UserId == uid);
        if (appItem is null) return NotFound();
        appItem.Status = req.Status;
        appItem.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return Ok(appItem);
    }
}
