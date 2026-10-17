
namespace backend.DTOs;

public class UserFlashcardResponseDto
{
    public int Id { get; set; }

    public int VocabularyId { get; set; }

    public int Interval { get; set; }

    public double EaseFactor { get; set; }

    public int Repetitions { get; set; }

    public DateTime NextReviewDate { get; set; }

    public VocabularyResponseDto? Vocabulary { get; set; }
}

public class VocabularyResponseDto
{
    public int Id { get; set; }

    public string WordSimplified { get; set; } = "";

    public string? WordTraditional { get; set; }

    public string Pinyin { get; set; } = "";

    public string? PartOfSpeech { get; set; }

    public string Meaning { get; set; } = "";

    public string? AudioUrl { get; set; }

    public string? ExampleSentence { get; set; }

    public string? ExamplePinyin { get; set; }

    public string? ExampleMeaning { get; set; }

    public int LessonId { get; set; }
}
