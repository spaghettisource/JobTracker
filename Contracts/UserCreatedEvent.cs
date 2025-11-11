namespace Contracts;

public record UserCreated(
    int Id,
    string Email,
    string Role,
    DateTime CreatedAtUtc
);
