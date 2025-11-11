using ApplicationsService.Models;
using ApplicationsService.Services;
using MassTransit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ApplicationsService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // 🟢 всички методи изискват JWT токен
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
            var subClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                           ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(subClaim))
                throw new UnauthorizedAccessException("Missing sub claim in token.");

            return int.Parse(subClaim);
        }

        // === GET /api/applications ===
        // 🧑 Обикновен потребител → вижда своите
        [HttpGet]
        [Authorize(Roles = "User,HR")] // 🟢 и HR може, но User вижда само своето
        public async Task<IActionResult> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var uid = CurrentUserId();
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            IQueryable<Application> query = _db.Applications;

            if (role != "HR")
                query = query.Where(a => a.UserId == uid);

            var items = await query
                .OrderByDescending(a => a.UpdatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(items);
        }

        // === GET /api/applications/search ===
        [HttpGet("search")]
        [Authorize(Roles = "User,HR")]
        public async Task<IActionResult> Search(
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string sortBy = "CreatedAt",
            [FromQuery] string sortDirection = "desc")
        {
            var uid = CurrentUserId();
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            var query = _db.Applications.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(a => a.Position.Contains(search) || a.Company.Contains(search));

            if (role != "HR")
                query = query.Where(a => a.UserId == uid);

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
        [Authorize(Roles = "User,HR")]
        public async Task<IActionResult> Create([FromBody] ApplicationCreateDto dto)
        {
            int userId = CurrentUserId();
            var created = await _applicationService.CreateApplicationAsync(dto, userId);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        // === GET /api/applications/{id} ===
        [HttpGet("{id:int}")]
        [Authorize(Roles = "User,HR")]
        public async Task<IActionResult> GetById(int id)
        {
            var uid = CurrentUserId();
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            var appItem = await _db.Applications.FirstOrDefaultAsync(a => a.Id == id);

            if (appItem is null)
                return NotFound();

            if (role != "HR" && appItem.UserId != uid)
                return Forbid();

            return Ok(appItem);
        }

        // === PATCH /api/applications/{id}/status ===
        // 🧩 HR може да сменя статусите на всички
        [HttpPatch("{id:int}/status")]
        [Authorize(Roles = "HR")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] ApplicationStatus status)
        {
            var appItem = await _db.Applications.FirstOrDefaultAsync(a => a.Id == id);
            if (appItem is null)
                return NotFound();

            appItem.Status = status;
            appItem.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return Ok(appItem);
        }

        // === PUT /api/applications/{id} ===
        [HttpPut("{id:int}")]
        [Authorize(Roles = "User,HR")]
        public async Task<IActionResult> UpdateApplication(int id, [FromBody] ApplicationUpdateDto dto)
        {
            var uid = CurrentUserId();
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            var existing = await _db.Applications.FirstOrDefaultAsync(a => a.Id == id);
            if (existing is null)
                return NotFound();

            if (role != "HR" && existing.UserId != uid)
                return Forbid();

            var updated = await _applicationService.UpdateApplicationAsync(id, dto);
            if (updated == null)
                return NotFound();

            return Ok(updated);
        }

        // === DELETE /api/applications/{id} ===
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "HR")] // 🧩 само HR може да трие
        public async Task<IActionResult> DeleteApplication(int id)
        {
            var appItem = await _db.Applications.FirstOrDefaultAsync(a => a.Id == id);
            if (appItem is null)
                return NotFound();

            _db.Applications.Remove(appItem);
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}
