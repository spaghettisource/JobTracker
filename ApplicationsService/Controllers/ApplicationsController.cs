using System.ComponentModel.DataAnnotations;
using ApplicationsService.Models;
using Contracts;
using MassTransit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ApplicationsService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ApplicationsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IPublishEndpoint _publish;

    public ApplicationsController(AppDbContext db, IPublishEndpoint publish)
    {
        _db = db;
        _publish = publish;
    }

    private int CurrentUserId()
    {
        var subClaim = User.Claims.FirstOrDefault(c =>
            c.Type == System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub ||
            c.Type.EndsWith("nameidentifier", StringComparison.OrdinalIgnoreCase));

        if (subClaim == null)
            throw new UnauthorizedAccessException("Missing sub claim in token.");

        return int.Parse(subClaim.Value);
    }

    // === GET /api/applications?page=1&pageSize=20 ===
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var uid = CurrentUserId();

        var query = _db.Applications
            .Where(a => a.UserId == uid)
            .OrderByDescending(a => a.UpdatedAt);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(items);
    }

    // === POST /api/applications ===
    public record CreateReq(
        [Required, MaxLength(100)] string Position,
        [Required, MaxLength(100)] string Company,
        string? Link,
        string? Notes
    );

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateReq req)
    {
        var now = DateTime.UtcNow;

        var app = new Application
        {
            Position = req.Position,
            Company = req.Company,
            Link = req.Link,
            Notes = req.Notes,
            UserId = CurrentUserId(),
            CreatedAt = now,
            UpdatedAt = now
        };

        _db.Applications.Add(app);
        await _db.SaveChangesAsync();

        // Publish event to RabbitMQ
        await _publish.Publish(new ApplicationCreated(
            app.Id,
            app.Position,
            app.Company,
            app.CreatedAt
        ));

        return CreatedAtAction(nameof(GetById), new { id = app.Id }, app);
    }

    // === GET /api/applications/{id} ===
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(Application), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var uid = CurrentUserId();
        var appItem = await _db.Applications.FirstOrDefaultAsync(a => a.Id == id && a.UserId == uid);

        return appItem is null ? NotFound() : Ok(appItem);
    }

    // === PATCH /api/applications/{id}/status ===
    public record StatusReq(ApplicationStatus Status);

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] StatusReq req)
    {
        var uid = CurrentUserId();
        var appItem = await _db.Applications.FirstOrDefaultAsync(a => a.Id == id && a.UserId == uid);

        if (appItem is null)
            return NotFound();

        appItem.Status = req.Status;
        appItem.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(appItem);
    }
}
