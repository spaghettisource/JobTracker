using Contracts;
using MassTransit;
using StackExchange.Redis;
using System.Text.Json;

namespace NotificationsService.Consumers;

public class UserCreatedConsumer : IConsumer<UserCreated>
{
    private readonly IDatabase _redis;

    public UserCreatedConsumer(IConnectionMultiplexer redis)
    {
        _redis = redis.GetDatabase();
    }

    public async Task Consume(ConsumeContext<UserCreated> context)
    {
        var user = context.Message;
        var json = JsonSerializer.Serialize(new { user.Id, user.Email, user.Role });

        await _redis.StringSetAsync($"user:{user.Id}", json);
        Console.WriteLine($"✅ Cached user: {user.Email} ({user.Role})");
    }
}
