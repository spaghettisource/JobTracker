using Ocelot.DependencyInjection;
using Ocelot.Middleware;

var builder = WebApplication.CreateBuilder(args);

// зареждаме конфигурацията
builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);

// добавяме CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// добавяме Ocelot
builder.Services.AddOcelot();

var app = builder.Build();

// активираме CORS преди UseOcelot
app.UseCors("AllowFrontend");

// Ocelot middleware
await app.UseOcelot();

app.Run();
