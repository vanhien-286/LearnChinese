namespace backend.DTOs
{
    public class SaveLessonResultRequest
    {
        public List<LessonAnswerRequest> Answers { get; set; } = new();
    }

    public class LessonAnswerRequest
    {
        public int VocabularyId { get; set; }
        public string Meaning { get; set; } = string.Empty;
        public string Word { get; set; } = string.Empty;
        public string Pinyin { get; set; } = string.Empty;
    }
}
