namespace backend.Entities
{
    public class HSKLevel
    {
        public int Id { get; set; } // 1 đến 9 theo chuẩn 3.0
        public string Title { get; set; } = string.Empty; // Ví dụ: "HSK 1 - Sơ cấp"
        public ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
        public ICollection<Exam> Exams { get; set; } = new List<Exam>();
    }
}