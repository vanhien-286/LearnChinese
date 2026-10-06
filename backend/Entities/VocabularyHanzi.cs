
namespace backend.Entities
{
    public class VocabularyHanzi
    {
        public int Id { get; set; }

        public int VocabularyId { get; set; }
        public Vocabulary Vocabulary { get; set; } = null!;

        public int HanziId { get; set; }
        public Hanzi Hanzi { get; set; } = null!;

        public int Position { get; set; }
    }
}