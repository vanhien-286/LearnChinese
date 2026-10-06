namespace backend.Entities
{
    public class Lesson
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int OrderIndex { get; set; } // Thứ tự bài học trong cấp độ

        public int HSKLevelId { get; set; }
        public HSKLevel HSKLevel { get; set; } = null!;

        public ICollection<Vocabulary> Vocabularies { get; set; } = new List<Vocabulary>();
        public ICollection<Grammar> Grammars { get; set; } = new List<Grammar>();
        public ICollection<Reading> Readings { get; set; } = new List<Reading>();
        public ICollection<UserLesson> UserLessons { get; set; } = new List<UserLesson>();
    }
}