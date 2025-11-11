using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using System.Text.Json;
using IdentityService.Models;

namespace IdentityService.Services;

public class RedisCacheService
{
    private readonly IDatabase _db;
    private readonly AppDbContext _context;

    public record UserCacheDto(int Id, string Email, string Role);

    public RedisCacheService(IConfiguration cfg, AppDbContext context)
    {
        var host = cfg["Redis:Host"] ?? "localhost";
        var port = cfg["Redis:Port"] ?? "6379";
        var mux = ConnectionMultiplexer.Connect($"{host}:{port}");
        _db = mux.GetDatabase();
        _context = context;
    }

    public async Task PreloadUsersAsync()
    {
        var users = await _context.Users
            .Select(u => new UserCacheDto(u.Id, u.Email, u.Role))
            .ToListAsync();

        var json = JsonSerializer.Serialize(users);
        await _db.StringSetAsync("users:cache", json);
    }

    public async Task<List<UserCacheDto>> GetAllUsersAsync()
    {
        var json = await _db.StringGetAsync("users:cache");
        if (json.IsNullOrEmpty) return new();
        return JsonSerializer.Deserialize<List<UserCacheDto>>(json!) ?? new();
    }

    public async Task AddOrUpdateUserAsync(User user)
    {
        var users = await GetAllUsersAsync();
        var existing = users.FirstOrDefault(u => u.Id == user.Id);
        if (existing != null) users.Remove(existing);
        users.Add(new UserCacheDto(user.Id, user.Email, user.Role));
        await _db.StringSetAsync("users:cache", JsonSerializer.Serialize(users));
    }
}
