using Microsoft.EntityFrameworkCore;
using backend.Entities;
namespace backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }
    public DbSet<Role> Roles { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<HSKLevel> HSKLevels { get; set; }
    public DbSet<Lesson> Lessons { get; set; }
    public DbSet<Vocabulary> Vocabularies { get; set; }
    public DbSet<Grammar> Grammars { get; set; }
    public DbSet<Reading> Readings { get; set; }
    public DbSet<UserLesson> UserLessons { get; set; }
    public DbSet<UserFlashcard> UserFlashcards { get; set; }
    public DbSet<Exam> Exams { get; set; }
    public DbSet<Question> Questions { get; set; }
    public DbSet<QuestionOption> QuestionOptions { get; set; }
    public DbSet<UserExamResult> UserExamResults { get; set; }
    public DbSet<Hanzi> Hanzis { get; set; }
    public DbSet<VocabularyHanzi> VocabularyHanzis { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // 1. Cấu hình Composite Key cho bảng tiến độ bài học UserLesson
        modelBuilder.Entity<UserLesson>()
            .HasKey(ul => new { ul.UserId, ul.LessonId });

        modelBuilder.Entity<UserLesson>()
            .HasOne(ul => ul.User)
            .WithMany(u => u.UserLessons)
            .HasForeignKey(ul => ul.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserLesson>()
            .HasOne(ul => ul.Lesson)
            .WithMany(l => l.UserLessons)
            .HasForeignKey(ul => ul.LessonId)
            .OnDelete(DeleteBehavior.Cascade);

        // 2. Cấu hình mối quan hệ Flashcard lặp lại ngắt quãng
        modelBuilder.Entity<UserFlashcard>()
            .HasOne(uf => uf.User)
            .WithMany(u => u.UserFlashcards)
            .HasForeignKey(uf => uf.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserFlashcard>()
            .HasOne(uf => uf.Vocabulary)
            .WithMany(v => v.UserFlashcards)
            .HasForeignKey(uf => uf.VocabularyId)
            .OnDelete(DeleteBehavior.Cascade);

        // 3. Đảm bảo tính duy nhất của Email người dùng
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // 4. Thiết lập quan hệ cấu trúc nội dung trong đề thi
        modelBuilder.Entity<QuestionOption>()
            .HasOne(qo => qo.Question)
            .WithMany(q => q.Options)
            .HasForeignKey(qo => qo.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<VocabularyHanzi>()
     .HasOne(vh => vh.Vocabulary)
     .WithMany(v => v.VocabularyHanzis)
     .HasForeignKey(vh => vh.VocabularyId)
     .OnDelete(DeleteBehavior.Cascade);

        // Quan hệ Hanzi - VocabularyHanzi
        modelBuilder.Entity<VocabularyHanzi>()
            .HasOne(vh => vh.Hanzi)
            .WithMany(h => h.VocabularyHanzis)
            .HasForeignKey(vh => vh.HanziId)
            .OnDelete(DeleteBehavior.Cascade);

        // Mỗi chữ Hán chỉ xuất hiện một lần trong bảng Hanzi
        modelBuilder.Entity<Hanzi>()
            .HasIndex(h => h.Character)
            .IsUnique();

        // Mỗi vị trí trong một từ chỉ có một chữ Hán
        modelBuilder.Entity<VocabularyHanzi>()
            .HasIndex(vh => new
            {
                vh.VocabularyId,
                vh.Position
            })
            .IsUnique();

        modelBuilder.Entity<HanziStroke>()
            .HasOne(s => s.Hanzi)
            .WithMany(h => h.Strokes)
            .HasForeignKey(s => s.HanziId)
            .OnDelete(DeleteBehavior.Cascade);

        // Mỗi chữ Hán không được có hai nét
        // trùng thứ tự.
        modelBuilder.Entity<HanziStroke>()
            .HasIndex(s => new
            {
                s.HanziId,
                s.StrokeNumber
            })
            .IsUnique();


        modelBuilder.Entity<HanziPronunciation>()
            .HasOne(p => p.Hanzi)
            .WithMany(h => h.Pronunciations)
            .HasForeignKey(p => p.HanziId)
            .OnDelete(DeleteBehavior.Cascade);

        // Hạn chế các bản ghi trùng Pinyin
        // trong cùng một chữ Hán.
        modelBuilder.Entity<HanziPronunciation>()
            .HasIndex(p => new
            {
                p.HanziId,
                p.Pinyin
            })
            .IsUnique();
    }
}