using IdentityService.Models;

namespace ApplicationsService.Models;

public enum ApplicationStatus { Applied, Interview, Offer, Rejected }

public class Application
{
    public int Id { get; set; }
    public string Position { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string? Link { get; set; }
    public string? Notes { get; set; }
    public ApplicationStatus Status { get; set; } = ApplicationStatus.Applied;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public int UserId { get; set; }             // от JWT (sub)
    public User User { get; set; } = null!;
}
