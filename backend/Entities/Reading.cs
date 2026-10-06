namespace backend.Entities
{
    public class Reading
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;       // Đoạn văn tiếng Trung
        public string? PinyinContent { get; set; }
        public string Translation { get; set; } = string.Empty;   // Bản dịch tiếng Việt

        public int LessonId { get; set; }
        public Lesson Lesson { get; set; } = null!;
    }
}