using System.Text.Json;
using System.Text.Json.Serialization;
using backend.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public static class VocabularyImporter
{
    public static void ReplaceHsk1(AppDbContext context, string jsonPath)
    {
        if (!File.Exists(jsonPath))
            throw new FileNotFoundException("Không tìm thấy file JSON HSK 1.", jsonPath);

        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        var json = File.ReadAllText(jsonPath);
        var rows = JsonSerializer.Deserialize<List<Hsk1VocabularyImportModel>>(
            json, options
        ) ?? throw new InvalidDataException("JSON HSK 1 không chứa danh sách từ vựng hợp lệ.");

        if (rows.Any(row =>
                !string.IsNullOrWhiteSpace(row.HskLevel) &&
                row.HskLevel.Trim() != "1"))
        {
            throw new InvalidDataException(
                "File seed chỉ được chứa dữ liệu HSK 1.");
        }

        var vocabularyRows = rows
            .Select(row => new Hsk1VocabularyRecord
            {
                WordSimplified = row.WordSimplified?.Trim() ?? string.Empty,
                WordTraditional = string.IsNullOrWhiteSpace(row.WordTraditional)
                    ? null
                    : row.WordTraditional.Trim(),
                Pinyin = row.Pinyin?.Trim() ?? string.Empty,
                PartOfSpeech = string.IsNullOrWhiteSpace(row.PartOfSpeech)
                    ? null
                    : row.PartOfSpeech.Trim(),
                Meaning = (string.IsNullOrWhiteSpace(row.MeaningVietnamese)
                    ? row.Meaning
                    : row.MeaningVietnamese)?.Trim() ?? string.Empty,
                AudioUrl = NormalizeAudioUrl(row.AudioUrl),
                ExampleSentence = NullIfWhiteSpace(
                    string.IsNullOrWhiteSpace(row.ExampleSentenceChinese)
                        ? row.ExampleSentence
                        : row.ExampleSentenceChinese),
                ExamplePinyin = NullIfWhiteSpace(
                    string.IsNullOrWhiteSpace(row.ExampleSentencePinyin)
                        ? row.ExamplePinyin
                        : row.ExampleSentencePinyin),
                ExampleMeaning = NullIfWhiteSpace(
                    string.IsNullOrWhiteSpace(row.ExampleSentenceVietnamese)
                        ? row.ExampleMeaning
                        : row.ExampleSentenceVietnamese),
                Topic = row.Topic?.Trim() ?? string.Empty
            })
            .ToList();

        if (vocabularyRows.Count == 0)
            throw new InvalidDataException("File JSON không có dữ liệu từ vựng HSK 1.");

        var invalidRow = vocabularyRows.FirstOrDefault(row =>
            string.IsNullOrWhiteSpace(row.WordSimplified) ||
            string.IsNullOrWhiteSpace(row.Pinyin) ||
            string.IsNullOrWhiteSpace(row.Meaning) ||
            string.IsNullOrWhiteSpace(row.Topic));

        if (invalidRow != null)
            throw new InvalidDataException(
                "Mỗi từ HSK 1 phải có chữ giản thể, pinyin, nghĩa tiếng Việt và chủ đề.");

        var uniqueVocabularyRows = vocabularyRows
            .DistinctBy(
                row => $"{row.WordSimplified}|{row.Pinyin}",
                StringComparer.OrdinalIgnoreCase)
            .ToList();

        var hsk1 = context.HSKLevels
            .SingleOrDefault(level => level.Title == "HSK 1 - Chuẩn mới");

        if (hsk1 == null)
        {
            hsk1 = new HSKLevel { Title = "HSK 1 - Chuẩn mới" };
            context.HSKLevels.Add(hsk1);
            context.SaveChanges();
        }

        var expectedKeys = uniqueVocabularyRows
            .Select(row => CreateVocabularyKey(
                row.WordSimplified,
                row.WordTraditional,
                row.Pinyin,
                row.PartOfSpeech,
                row.Meaning,
                row.AudioUrl,
                row.ExampleSentence,
                row.ExamplePinyin,
                row.ExampleMeaning,
                row.Topic))
            .ToHashSet(StringComparer.Ordinal);

        var existingVocabulary = context.Vocabularies
            .AsNoTracking()
            .Where(vocabulary => vocabulary.Lesson.HSKLevelId == hsk1.Id)
            .Select(vocabulary => new
            {
                vocabulary.WordSimplified,
                vocabulary.WordTraditional,
                vocabulary.Pinyin,
                vocabulary.PartOfSpeech,
                vocabulary.Meaning,
                AudioUrl = vocabulary.AudioUrl,
                vocabulary.ExampleSentence,
                vocabulary.ExamplePinyin,
                vocabulary.ExampleMeaning,
                LessonTitle = vocabulary.Lesson.Title
            })
            .ToList();

        var existingKeys = existingVocabulary
            .Select(row => CreateVocabularyKey(
                row.WordSimplified,
                row.WordTraditional,
                row.Pinyin,
                row.PartOfSpeech,
                row.Meaning,
                NormalizeAudioUrl(row.AudioUrl),
                row.ExampleSentence,
                row.ExamplePinyin,
                row.ExampleMeaning,
                row.LessonTitle))
            .ToHashSet(StringComparer.Ordinal);

        if (existingVocabulary.Count == uniqueVocabularyRows.Count &&
            existingKeys.SetEquals(expectedKeys))
        {
            var hsk1Vocabulary = context.Vocabularies
                .Where(vocabulary => vocabulary.Lesson.HSKLevelId == hsk1.Id)
                .ToList();

            foreach (var vocabulary in hsk1Vocabulary)
            {
                var normalizedAudioUrl = NormalizeAudioUrl(vocabulary.AudioUrl);
                if (vocabulary.AudioUrl != normalizedAudioUrl)
                    vocabulary.AudioUrl = normalizedAudioUrl;
            }

            context.SaveChanges();
            Console.WriteLine(
                $"HSK 1 đã khớp file seed: {uniqueVocabularyRows.Count} từ; đã chuẩn hóa đường dẫn audio nếu cần.");
            return;
        }

        using var transaction = context.Database.BeginTransaction();

        var oldVocabulary = context.Vocabularies
            .Where(vocabulary => vocabulary.Lesson.HSKLevelId == hsk1.Id)
            .ToList();
        var oldFlashcards = context.UserFlashcards
            .Where(flashcard =>
                flashcard.Vocabulary!.Lesson.HSKLevelId == hsk1.Id)
            .ToList();
        var oldVocabularyHanzi = context.VocabularyHanzis
            .Where(link =>
                link.Vocabulary.Lesson.HSKLevelId == hsk1.Id)
            .ToList();

        context.UserFlashcards.RemoveRange(oldFlashcards);
        context.VocabularyHanzis.RemoveRange(oldVocabularyHanzi);
        context.Vocabularies.RemoveRange(oldVocabulary);
        context.SaveChanges();

        var topics = uniqueVocabularyRows
            .Select(row => row.Topic)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
        var topicTitles = topics.ToHashSet(StringComparer.OrdinalIgnoreCase);
        var hsk1Lessons = context.Lessons
            .Where(lesson => lesson.HSKLevelId == hsk1.Id)
            .ToList();

        var lessonIdsWithContent = context.Grammars
            .Where(grammar => grammar.Lesson.HSKLevelId == hsk1.Id)
            .Select(grammar => grammar.LessonId)
            .Union(context.Readings
                .Where(reading => reading.Lesson.HSKLevelId == hsk1.Id)
                .Select(reading => reading.LessonId))
            .Union(context.UserLessons
                .Where(userLesson => userLesson.Lesson.HSKLevelId == hsk1.Id)
                .Select(userLesson => userLesson.LessonId))
            .ToHashSet();

        var staleEmptyLessons = hsk1Lessons
            .Where(lesson =>
                !topicTitles.Contains(lesson.Title) &&
                !lessonIdsWithContent.Contains(lesson.Id))
            .ToList();
        context.Lessons.RemoveRange(staleEmptyLessons);

        var lessonsByTitle = hsk1Lessons
            .Where(lesson => !staleEmptyLessons.Contains(lesson))
            .GroupBy(lesson => lesson.Title, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(
                group => group.Key,
                group => group.First(),
                StringComparer.OrdinalIgnoreCase);

        for (var index = 0; index < topics.Count; index++)
        {
            var topic = topics[index];
            if (!lessonsByTitle.TryGetValue(topic, out var lesson))
            {
                lesson = new Lesson
                {
                    Title = topic,
                    HSKLevelId = hsk1.Id
                };
                context.Lessons.Add(lesson);
                lessonsByTitle.Add(topic, lesson);
            }

            lesson.OrderIndex = index + 1;
            lesson.Description = $"Từ vựng HSK 1 chủ đề {topic}";
        }

        var preservedEmptyLessons = hsk1Lessons
            .Where(lesson =>
                !staleEmptyLessons.Contains(lesson) &&
                !topicTitles.Contains(lesson.Title))
            .OrderBy(lesson => lesson.OrderIndex)
            .ToList();
        for (var index = 0; index < preservedEmptyLessons.Count; index++)
        {
            preservedEmptyLessons[index].OrderIndex = topics.Count + index + 1;
        }

        context.SaveChanges();

        var importedVocabulary = uniqueVocabularyRows
            .Select(row => new Vocabulary
            {
                WordSimplified = row.WordSimplified,
                WordTraditional = row.WordTraditional,
                Pinyin = row.Pinyin,
                PartOfSpeech = row.PartOfSpeech,
                Meaning = row.Meaning,
                AudioUrl = row.AudioUrl,
                ExampleSentence = row.ExampleSentence,
                ExamplePinyin = row.ExamplePinyin,
                ExampleMeaning = row.ExampleMeaning,
                LessonId = lessonsByTitle[row.Topic].Id
            })
            .ToList();

        context.Vocabularies.AddRange(importedVocabulary);
        context.SaveChanges();
        transaction.Commit();

        Console.WriteLine(
            $"Đã thay thế dữ liệu HSK 1: {importedVocabulary.Count} từ trong {topics.Count} chủ đề.");
        Console.WriteLine(
            $"Đã xóa {oldVocabulary.Count} từ cũ và flashcard liên kết; dữ liệu cấp độ khác được giữ nguyên.");
    }

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

    private static string? NullIfWhiteSpace(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static string? NormalizeAudioUrl(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        var normalizedPath = value.Trim().Replace('\\', '/');
        var fileName = normalizedPath[(normalizedPath.LastIndexOf('/') + 1)..];
        return string.IsNullOrWhiteSpace(fileName)
            ? null
            : $"/audio/{Uri.EscapeDataString(fileName)}";
    }

    private static string CreateVocabularyKey(
        string wordSimplified,
        string? wordTraditional,
        string pinyin,
        string? partOfSpeech,
        string meaning,
        string? audioUrl,
        string? exampleSentence,
        string? examplePinyin,
        string? exampleMeaning,
        string topic)
    {
        static string Normalize(string? value) => value?.Trim() ?? string.Empty;

        return string.Join(
            "\u001f",
            Normalize(wordSimplified),
            Normalize(wordTraditional),
            Normalize(pinyin),
            Normalize(partOfSpeech),
            Normalize(meaning),
            Normalize(audioUrl),
            Normalize(exampleSentence),
            Normalize(examplePinyin),
            Normalize(exampleMeaning),
            Normalize(topic));
    }

}

internal sealed class Hsk1VocabularyRecord
{
    public string WordSimplified { get; init; } = string.Empty;
    public string? WordTraditional { get; init; }
    public string Pinyin { get; init; } = string.Empty;
    public string? PartOfSpeech { get; init; }
    public string Meaning { get; init; } = string.Empty;
    public string? AudioUrl { get; init; }
    public string? ExampleSentence { get; init; }
    public string? ExamplePinyin { get; init; }
    public string? ExampleMeaning { get; init; }
    public string Topic { get; init; } = string.Empty;
}

public class Hsk1VocabularyImportModel
{
    public string? WordSimplified { get; set; }
    public string? WordTraditional { get; set; }
    public string? Pinyin { get; set; }
    public string? PartOfSpeech { get; set; }
    public string? Meaning { get; set; }
    public string? MeaningVietnamese { get; set; }
    public string? AudioUrl { get; set; }
    public string? ExampleSentence { get; set; }
    public string? ExampleSentenceChinese { get; set; }
    public string? ExamplePinyin { get; set; }
    public string? ExampleSentencePinyin { get; set; }
    public string? ExampleMeaning { get; set; }
    public string? ExampleSentenceVietnamese { get; set; }
    public string? HskLevel { get; set; }
    public string? Topic { get; set; }
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
