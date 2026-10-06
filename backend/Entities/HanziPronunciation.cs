namespace backend.Entities
{
    public class HanziPronunciation
    {
        public int Id { get; set; }
        public int HanziId { get; set; }
        public Hanzi Hanzi { get; set; } = null!;
        public string Pinyin { get; set; } = string.Empty;  // Phiên âm
        public string? AudioUrl { get; set; }
        public string? Meaning { get; set; }
    }
}