namespace backend.Entities
{
    public class Login
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public DateTime LastLogin { get; set; }
    }
}