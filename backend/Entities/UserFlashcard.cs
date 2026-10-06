namespace backend.Entities
{
    public class UserFlashcard
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public int VocabularyId { get; set; }
        public Vocabulary Vocabulary { get; set; } = null!;

        // Phục vụ thuật toán SuperMemo SM-2 (Spaced Repetition)
        public int Interval { get; set; } = 0;          // Khoảng thời gian giãn cách (ngày)
        public double EaseFactor { get; set; } = 2.5;   // Độ dễ của từ
        public int Repetitions { get; set; } = 0;       // Số lần đã ôn tập thành công
        public DateTime NextReviewDate { get; set; } = DateTime.UtcNow; // Ngày tiếp theo bắt buộc phải ôn lại
    }
}