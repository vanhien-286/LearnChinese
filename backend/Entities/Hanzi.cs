namespace backend.Entities
{
    public class Hanzi
    {
        public int Id { get; set; }
        public string Character { get; set; } = string.Empty; // Chữ Hán                  // Phiên âm
        public string? Meaning { get; set; }                   // Nghĩa tiếng Việt

        public int StrokeCount { get; set; } // Số nét

        public ICollection<HanziStroke> Strokes { get; set; } = new List<HanziStroke>();
        public ICollection<HanziPronunciation> Pronunciations { get; set; } = new List<HanziPronunciation>();

        public ICollection<VocabularyHanzi> VocabularyHanzis { get; set; } = new List<VocabularyHanzi>();
    }
}