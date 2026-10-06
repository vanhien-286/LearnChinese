namespace backend.Entities
{
    public class Vocabulary
    {
        public int Id { get; set; }
        public string WordSimplified { get; set; } = string.Empty; // Chữ giản thể
        public string? WordTraditional { get; set; }              // Chữ phồn thể
        public string Pinyin { get; set; } = string.Empty;  // Phiên âm
        public string? PartOfSpeech { get; set; }
        public string Meaning { get; set; } = string.Empty;
        // Nghĩa tiếng Việt
        public string? AudioUrl { get; set; }                      // File phát âm mẫu
        public string? ExampleSentence { get; set; }               // Câu ví dụ mẫu
        public string? ExamplePinyin { get; set; }
        public string? ExampleMeaning { get; set; }

        public int LessonId { get; set; }
        public Lesson Lesson { get; set; } = null!;
        public ICollection<UserFlashcard> UserFlashcards { get; set; }
        = new List<UserFlashcard>();

        public ICollection<VocabularyHanzi> VocabularyHanzis { get; set; }
        = new List<VocabularyHanzi>();
    }
}