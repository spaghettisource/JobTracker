using Contracts;
using MassTransit;

namespace NotificationsService.Consumers;

public class ApplicationCreatedConsumer : IConsumer<ApplicationCreated>
{
    private static readonly List<string> Notifications = new();

    public Task Consume(ConsumeContext<ApplicationCreated> context)
    {
        var msg = $"🆕 {context.Message.Position} at {context.Message.Company}";
        Notifications.Add(msg);
        Console.WriteLine($"📩 Received event: {msg}");
        return Task.CompletedTask;
    }

    // Връща и трие — нотификациите се показват еднократно
    public static List<string> GetAndClear()
    {
        var copy = new List<string>(Notifications);
        Notifications.Clear();
        return copy;
    }
}
