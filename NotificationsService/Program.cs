using MassTransit;
using NotificationsService.Consumers;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<ApplicationCreatedConsumer>();

    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host("localhost", "/", h =>
        {
            h.Username("guest");
            h.Password("guest");
        });

        cfg.ReceiveEndpoint("application_created_queue", e =>
        {
            e.ConfigureConsumer<ApplicationCreatedConsumer>(context);
        });
    });
});

var app = builder.Build();

app.MapControllers();

// Simple test endpoint to get notifications
app.MapGet("/api/notifications", () =>
{
    return ApplicationCreatedConsumer.GetAll();
});

app.Run();
