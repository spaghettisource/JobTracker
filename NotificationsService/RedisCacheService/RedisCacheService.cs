using StackExchange.Redis;
using System.Text.Json;

namespace NotificationsService.Services;

public class RedisCacheService
{
    private readonly IDatabase _db;
    private readonly ILogger<RedisCacheService> _log;

    public RedisCacheService(IConfiguration cfg, ILogger<RedisCacheService> log)
    {
        _log = log;
        var redis = ConnectionMultiplexer.Connect(cfg.GetConnectionString("Redis") ?? "localhost:6379");
        _db = redis.GetDatabase();
    }

    public async Task CacheUserAsync(int id, string email, string role)
    {
        var json = JsonSerializer.Serialize(new { id, email, role });
        await _db.StringSetAsync($"user:{id}", json);
        _log.LogInformation("💾 Cached user {Id} ({Email})", id, email);
    }

    public async Task<(string Email, string Role)?> GetUserAsync(int id)
    {
        var data = await _db.StringGetAsync($"user:{id}");
        if (data.IsNullOrEmpty) return null;

        var obj = JsonSerializer.Deserialize<UserCacheDto>(data!);
        return (obj!.Email, obj.Role);
    }

    public async Task<List<UserCacheDto>> GetAllUsersAsync()
    {
        var endpoints = _db.Multiplexer.GetEndPoints();
        var server = _db.Multiplexer.GetServer(endpoints.First());
        var keys = server.Keys(pattern: "user:*");

        var result = new List<UserCacheDto>();
        foreach (var key in keys)
        {
            var data = await _db.StringGetAsync(key);
            if (!data.IsNullOrEmpty)
            {
                var obj = JsonSerializer.Deserialize<UserCacheDto>(data!);
                if (obj != null) result.Add(obj);
            }
        }
        return result;
    }

    public class UserCacheDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = "";
        public string Role { get; set; } = "";
    }
}
