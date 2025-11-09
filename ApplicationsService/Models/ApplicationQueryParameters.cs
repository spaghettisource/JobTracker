namespace ApplicationsService.Models
{
    public class ApplicationQueryParameters
    {
        public string? Search { get; set; } // търсене по Title
        public string? CompanyName { get; set; } // филтър по име
        public DateTime? CreatedAfter { get; set; }
        public DateTime? CreatedBefore { get; set; }
        public string? SortBy { get; set; } = "CreatedAt";
        public string? SortDirection { get; set; } = "desc";
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
