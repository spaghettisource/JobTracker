namespace ApplicationsService.Models
{
    public class ApplicationUpdateDto
    {
        public string Position { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public string? Link { get; set; }
        public string? Notes { get; set; }
        public ApplicationStatus Status { get; set; }
    }
}
