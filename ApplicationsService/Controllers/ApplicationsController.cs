using ApplicationsService.Models;
using ApplicationsService.Services;
using MassTransit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ApplicationsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IPublishEndpoint _publish;
    private readonly ApplicationService _applicationService;

    public ApplicationsController(AppDbContext db, IPublishEndpoint publish, ApplicationService applicationService)
    {
        _db = db;
        _publish = publish;
        _applicationService = applicationService;
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

    // === GET /api/applications ===
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

    // === GET /api/applications/search ===
    [HttpGet("search")]
    public async Task<IActionResult> Search(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string sortBy = "CreatedAt",
        [FromQuery] string sortDirection = "desc")
    {
        var query = _db.Applications.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(a =>
                a.Position.Contains(search) || a.Company.Contains(search));
        }

        query = sortBy switch
        {
            "Position" => sortDirection == "asc"
                ? query.OrderBy(a => a.Position)
                : query.OrderByDescending(a => a.Position),
            "Company" => sortDirection == "asc"
                ? query.OrderBy(a => a.Company)
                : query.OrderByDescending(a => a.Company),
            _ => sortDirection == "asc"
                ? query.OrderBy(a => a.CreatedAt)
                : query.OrderByDescending(a => a.CreatedAt)
        };

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new { items, totalCount, page, pageSize });
    }

    // === POST /api/applications ===
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ApplicationCreateDto dto)
    {
        int userId = CurrentUserId();
        var created = await _applicationService.CreateApplicationAsync(dto, userId);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    // === GET /api/applications/{id} ===
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var uid = CurrentUserId();
        var appItem = await _db.Applications.FirstOrDefaultAsync(a => a.Id == id && a.UserId == uid);
        return appItem is null ? NotFound() : Ok(appItem);
    }

    // === PATCH /api/applications/{id}/status ===
    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] ApplicationStatus status)
    {
        var uid = CurrentUserId();
        var appItem = await _db.Applications.FirstOrDefaultAsync(a => a.Id == id && a.UserId == uid);
        if (appItem is null)
            return NotFound();

        appItem.Status = status;
        appItem.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(appItem);
    }

    // === PUT /api/applications/{id} ===
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateApplication(int id, [FromBody] ApplicationUpdateDto dto)
    {
        var updated = await _applicationService.UpdateApplicationAsync(id, dto);
        if (updated == null)
            return NotFound();
        return Ok(updated);
    }

    // === DELETE /api/applications/{id} ===
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteApplication(int id)
    {
        var deleted = await _applicationService.DeleteApplicationAsync(id);
        if (!deleted)
            return NotFound();
        return NoContent();
    }
}
