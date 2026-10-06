namespace backend.Entities
{
    public class QuestionOption
    {
        public int Id { get; set; }
        public string OptionText { get; set; } = string.Empty; // Nội dung đáp án (A, B, C, D)
        public bool IsCorrect { get; set; } = false;           // Đáp án này đúng hay sai

        public int QuestionId { get; set; }
        public Question Question { get; set; } = null!;
    }
}