using System.Text.Json;
using System.Text.Json.Serialization;
using backend.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public static class VocabularyImporter
{
    public static void Import(AppDbContext context, string jsonPath)
    {
        if (!File.Exists(jsonPath))
            throw new FileNotFoundException("Không tìm thấy file JSON.", jsonPath);

        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        var json = File.ReadAllText(jsonPath);
        var data = JsonSerializer.Deserialize<VocabularyImportModel>(
            json, options
        ) ?? throw new InvalidDataException("JSON không hợp lệ.");

        if (data.Schema != "VocabularyImport/1.0")
            throw new InvalidDataException("Phiên bản JSON không được hỗ trợ.");

        using var transaction = context.Database.BeginTransaction();

        var imported = 0;
        var skipped = 0;

        foreach (var group in data.Lessons)
        {
            if (!int.TryParse(group.HskLevel, out var levelNumber))
            {
                if (group.HskLevel != "7-9")
                    throw new InvalidDataException(
                        $"Cấp độ HSK không hợp lệ: {group.HskLevel}");
            }

            var levelTitle = group.HskLevel == "7-9"
                ? "HSK 7-9 - Chuẩn mới"
                : $"HSK {levelNumber} - Chuẩn mới";

            var level = context.HSKLevels
                .SingleOrDefault(x => x.Title == levelTitle);

            if (level == null)
            {
                level = new HSKLevel { Title = levelTitle };
                context.HSKLevels.Add(level);
                context.SaveChanges();
            }

            var lessonTitle = group.Topic.Trim();

            var lesson = context.Lessons.SingleOrDefault(x =>
                x.HSKLevelId == level.Id &&
                x.Title == lessonTitle);

            if (lesson == null)
            {
                var orderIndex = context.Lessons
                    .Where(x => x.HSKLevelId == level.Id)
                    .Select(x => (int?)x.OrderIndex)
                    .Max() ?? 0;

                lesson = new Lesson
                {
                    Title = lessonTitle,
                    Description = $"Từ vựng chủ đề {lessonTitle}",
                    OrderIndex = orderIndex + 1,
                    HSKLevelId = level.Id
                };

                context.Lessons.Add(lesson);
                context.SaveChanges();
            }

            // Đọc toàn bộ từ vựng thuộc cấp độ này.
            var existing = context.Vocabularies
                .Include(v => v.Lesson)
                .Where(v => v.Lesson.HSKLevelId == level.Id)
                .ToList();

            var existingKeys = existing
                .Select(v => $"{v.WordSimplified}|{v.Pinyin}")
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            foreach (var item in group.Vocabulary)
            {
                var word = item.WordSimplified?.Trim();
                var pinyin = item.Pinyin?.Trim();

                if (string.IsNullOrWhiteSpace(word) ||
                    string.IsNullOrWhiteSpace(pinyin))
                {
                    skipped++;
                    continue;
                }

                var key = $"{word}|{pinyin}";

                if (!existingKeys.Add(key))
                {
                    // Nếu từ đang nằm trong bài học HSK 1 cũ,
                    // chuyển nó sang bài học theo chủ đề.
                    var old = existing.FirstOrDefault(v =>
                        $"{v.WordSimplified}|{v.Pinyin}"
                            .Equals(key, StringComparison.OrdinalIgnoreCase));

                    if (old != null &&
                        old.Lesson.Title == "Toàn bộ từ vựng HSK 1" &&
                        levelNumber == 1)
                    {
                        old.LessonId = lesson.Id;
                    }

                    skipped++;
                    continue;
                }

                context.Vocabularies.Add(new Vocabulary
                {
                    WordSimplified = word,
                    WordTraditional = item.WordTraditional,
                    Pinyin = pinyin,
                    PartOfSpeech = item.PartOfSpeech,
                    Meaning = item.Meaning ?? string.Empty,
                    AudioUrl = item.AudioUrl,
                    ExampleSentence = item.ExampleSentence,
                    ExamplePinyin = item.ExamplePinyin,
                    ExampleMeaning = item.ExampleMeaning,
                    LessonId = lesson.Id
                });

                imported++;
            }

            context.SaveChanges();
        }

        transaction.Commit();

        Console.WriteLine($"Import hoàn tất: {imported} từ mới.");
        Console.WriteLine($"Bỏ qua hoặc đã tồn tại: {skipped} từ.");
    }

}

public class VocabularyImportModel
{
    public string Schema { get; set; } = string.Empty;
    public List<ImportLessonModel> Lessons { get; set; } = new();
}

public class ImportLessonModel
{
    public string LessonKey { get; set; } = string.Empty;
    public string Curriculum { get; set; } = string.Empty;
    public string HskVersion { get; set; } = string.Empty;
    public string HskLevel { get; set; } = string.Empty;
    public string Topic { get; set; } = string.Empty;
    public List<ImportVocabularyModel> Vocabulary { get; set; } = new();
}

public class ImportVocabularyModel
{
    public string? WordSimplified { get; set; }
    public string? WordTraditional { get; set; }
    public string? Pinyin { get; set; }
    public string? PartOfSpeech { get; set; }
    public string? Meaning { get; set; }
    public string? AudioUrl { get; set; }
    public string? ExampleSentence { get; set; }
    public string? ExamplePinyin { get; set; }
    public string? ExampleMeaning { get; set; }
    public string? SourceId { get; set; }
    public string? MeaningEnglishReference { get; set; }
}
