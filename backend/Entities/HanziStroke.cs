namespace backend.Entities
{
    public class HanziStroke
    {
        public int Id { get; set; }
        public int HanziId { get; set; }
        public Hanzi Hanzi { get; set; } = null!;
        public int StrokeNumber { get; set; } // Thứ tự nét
        public string StrokeType { get; set; } = string.Empty; // Loại nét

        public string StrokeData { get; set; } = string.Empty; // Đường dẫn nét
    }
}