namespace backend.Entities
{
    public class Question
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty; // Nội dung câu hỏi
        public string? AudioUrl { get; set; }              // Dành cho phần thi Nghe (Listening)
        public string SectionType { get; set; } = "Listening"; // Listening, Reading, Writing

        public int ExamId { get; set; }
        public Exam Exam { get; set; } = null!;

        public ICollection<QuestionOption> Options { get; set; } = new List<QuestionOption>();
    }
}