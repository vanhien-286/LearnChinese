namespace backend.Entities
{
    public class Grammar
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Structure { get; set; } = string.Empty;     // Cấu trúc ngữ pháp chính
        public string Explanation { get; set; } = string.Empty;   // Giải nghĩa cách dùng
        public string? Example { get; set; }
        public string? ExampleMeaning { get; set; }

        public int LessonId { get; set; }
        public Lesson Lesson { get; set; } = null!;
    }
}