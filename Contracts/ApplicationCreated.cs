namespace Contracts;

public record ApplicationCreated(
    int Id,
    string Position,
    string Company,
    DateTime CreatedAtUtc
);
