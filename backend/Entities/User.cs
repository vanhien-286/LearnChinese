namespace backend.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int RoleId { get; set; }
        public Role Role { get; set; } = null!;

        // Các mối quan hệ tracking tiến độ
        public ICollection<UserLesson> UserLessons { get; set; } = new List<UserLesson>();
        public ICollection<UserFlashcard> UserFlashcards { get; set; } = new List<UserFlashcard>();
        public ICollection<UserExamResult> UserExamResults { get; set; } = new List<UserExamResult>();
    }
}