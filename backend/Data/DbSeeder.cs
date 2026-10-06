using System.Text.Json;
using backend.Entities;

namespace backend.Data;

public static class DbSeeder
{
    public static void Seed(AppDbContext context)
    {
        var hsk1 = context.HSKLevels
            .SingleOrDefault(level => level.Title == "HSK 1 - Chuẩn mới");

        if (hsk1 == null)
        {
            hsk1 = new HSKLevel { Title = "HSK 1 - Chuẩn mới" };
            context.HSKLevels.Add(hsk1);
            context.SaveChanges();
        }

        var defaultLesson = context.Lessons
            .SingleOrDefault(lesson =>
                lesson.HSKLevelId == hsk1.Id &&
                lesson.Title == "Toàn bộ từ vựng HSK 1");

        if (defaultLesson == null)
        {
            defaultLesson = new Lesson
            {
                Title = "Toàn bộ từ vựng HSK 1",
                OrderIndex = 1,
                HSKLevelId = hsk1.Id
            };
            context.Lessons.Add(defaultLesson);
            context.SaveChanges();
        }

        var jsonPath = Path.Combine(Directory.GetCurrentDirectory(), "Data", "Seeds", "hsk1.json");

        if (!File.Exists(jsonPath))
        {
            throw new FileNotFoundException("Không tìm thấy file seed HSK1.", jsonPath);
        }

        var jsonString = File.ReadAllText(jsonPath);
        var vocabSeeds = JsonSerializer.Deserialize<List<VocabSeedModel>>(jsonString)
            ?? throw new InvalidDataException("File seed HSK1 không chứa danh sách từ vựng hợp lệ.");

        var existingKeys = context.Vocabularies
            .Where(vocabulary => vocabulary.LessonId == defaultLesson.Id)
            .Select(vocabulary => vocabulary.WordSimplified + "|" + vocabulary.Pinyin)
            .ToHashSet();

        var vocabularies = vocabSeeds
            .Where(seed => !string.IsNullOrWhiteSpace(seed.Word))
            .Where(seed => existingKeys.Add(seed.Word + "|" + seed.Pinyin))
            .Select(seed => new Vocabulary
            {
                WordSimplified = seed.Word.Trim(),
                Pinyin = seed.Pinyin.Trim(),
                Meaning = seed.Meaning.Trim(),
                PartOfSpeech = seed.PartOfSpeech.Trim(),
                LessonId = defaultLesson.Id
            })
            .ToList();

        if (vocabularies.Count > 0)
        {
            context.Vocabularies.AddRange(vocabularies);
            context.SaveChanges();
        }
    }
}

// Lớp đệm để hứng dữ liệu từ file JSON
public class VocabSeedModel
{
    public string Word { get; set; } = string.Empty;
    public string Pinyin { get; set; } = string.Empty;
    public string PartOfSpeech { get; set; } = string.Empty;
    public string Meaning { get; set; } = string.Empty;
}