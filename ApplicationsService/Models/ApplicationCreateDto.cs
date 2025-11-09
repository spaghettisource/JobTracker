namespace ApplicationsService.Models
{
    public class ApplicationCreateDto
    {
        public string Position { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public string? Link { get; set; }
        public string? Notes { get; set; }
        public ApplicationStatus Status { get; set; } = ApplicationStatus.Applied;
    }
}
