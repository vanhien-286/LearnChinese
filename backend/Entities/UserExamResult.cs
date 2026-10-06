namespace backend.Entities
{
    public class UserExamResult
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public int ExamId { get; set; }
        public Exam Exam { get; set; } = null!;

        public int Score { get; set; }                     // Điểm số đạt được
        public int CorrectAnswers { get; set; }            // Số câu trả lời đúng
        public int TotalQuestions { get; set; }            // Tổng số câu hỏi của đề đó
        public DateTime TakenAt { get; set; } = DateTime.UtcNow;
    }
}