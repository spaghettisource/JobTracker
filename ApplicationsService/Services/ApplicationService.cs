using ApplicationsService.Models;
using Microsoft.EntityFrameworkCore;

namespace ApplicationsService.Services
{
    public class ApplicationService
    {
        private readonly AppDbContext _context;

        public ApplicationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Application> CreateApplicationAsync(ApplicationCreateDto dto, int userId)
        {
            var application = new Application
            {
                Position = dto.Position,
                Company = dto.Company,
                Link = dto.Link,
                Notes = dto.Notes,
                Status = dto.Status,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                UserId = userId
            };

            _context.Applications.Add(application);
            await _context.SaveChangesAsync();
            return application;
        }

        public async Task<Application?> UpdateApplicationAsync(int id, ApplicationUpdateDto dto)
        {
            var existing = await _context.Applications.FindAsync(id);
            if (existing == null)
                return null;

            existing.Position = dto.Position;
            existing.Company = dto.Company;
            existing.Link = dto.Link;
            existing.Notes = dto.Notes;
            existing.Status = dto.Status;
            existing.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteApplicationAsync(int id)
        {
            var existing = await _context.Applications.FindAsync(id);
            if (existing == null)
                return false;

            _context.Applications.Remove(existing);
            await _context.SaveChangesAsync();
            return true;
        }



        public async Task<PagedResult<Application>> GetApplicationsAsync(ApplicationQueryParameters parameters)
        {
            var query = _context.Applications.AsQueryable();

            // Search по Title
            if (!string.IsNullOrWhiteSpace(parameters.Search))
                query = query.Where(a => a.Position.Contains(parameters.Search));

            // Filter по CompanyName
            if (!string.IsNullOrWhiteSpace(parameters.CompanyName))
                query = query.Where(a => a.Company == parameters.CompanyName);

            // Filter по CreatedAt
            if (parameters.CreatedAfter.HasValue)
                query = query.Where(a => a.CreatedAt >= parameters.CreatedAfter.Value);

            if (parameters.CreatedBefore.HasValue)
                query = query.Where(a => a.CreatedAt <= parameters.CreatedBefore.Value);

            // Sorting
            query = parameters.SortBy?.ToLower() switch
            {
                "title" => parameters.SortDirection == "asc"
                    ? query.OrderBy(a => a.Position)
                    : query.OrderByDescending(a => a.Position),

                "companyname" => parameters.SortDirection == "asc"
                    ? query.OrderBy(a => a.Company)
                    : query.OrderByDescending(a => a.Company),

                _ => parameters.SortDirection == "asc"
                    ? query.OrderBy(a => a.CreatedAt)
                    : query.OrderByDescending(a => a.CreatedAt)
            };

            // Pagination
            var totalCount = await query.CountAsync();
            var items = await query
                .Skip((parameters.Page - 1) * parameters.PageSize)
                .Take(parameters.PageSize)
                .ToListAsync();

            return new PagedResult<Application>
            {
                Items = items,
                TotalCount = totalCount,
                Page = parameters.Page,
                PageSize = parameters.PageSize
            };
        }
    }
}
