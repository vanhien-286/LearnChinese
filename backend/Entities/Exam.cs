namespace backend.Entities
{
    public class Exam
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public int DurationMinutes { get; set; } // Thời gian làm bài (ví dụ: 40 phút)

        public int HSKLevelId { get; set; }
        public HSKLevel HSKLevel { get; set; } = null!;

        public ICollection<Question> Questions { get; set; } = new List<Question>();
        public ICollection<UserExamResult> UserExamResults { get; set; } = new List<UserExamResult>();
    }
}