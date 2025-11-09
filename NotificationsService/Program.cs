using MassTransit;
using NotificationsService.Consumers;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy
            .WithOrigins("http://localhost:3000") // React dev server
            .AllowAnyHeader()
            .AllowAnyMethod());
});

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

app.UseCors("AllowFrontend");

app.MapControllers();

app.MapGet("/api/notifications", () =>
{
    return ApplicationCreatedConsumer.GetAndClear();
});

app.Run();
