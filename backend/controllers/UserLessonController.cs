using System.Security.Claims;
using backend.Data;
using backend.DTOs;
using backend.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserLessonController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserLessonController(AppDbContext context)
        {
            _context = context;
        }

        private bool TryGetCurrentUserId(out int userId)
        {
            return int.TryParse(
                User.FindFirstValue(ClaimTypes.NameIdentifier),
                out userId);
        }

        [HttpGet("level/{levelId:int}")]
        public async Task<IActionResult> GetLessonProgress(int levelId)
        {
            if (!TryGetCurrentUserId(out var userId))
            {
                return Unauthorized();
            }

            var levelExists = await _context.HSKLevels
                .AnyAsync(level => level.Id == levelId);
            if (!levelExists)
            {
                return NotFound(new { message = "Không tìm thấy cấp độ HSK." });
            }

            var progress = await _context.UserLessons
                .AsNoTracking()
                .Where(item =>
                    item.UserId == userId &&
                    item.Lesson.HSKLevelId == levelId)
                .Select(item => new
                {
                    lessonId = item.LessonId,
                    item.IsCompleted,
                    item.CompletedAt
                })
                .ToListAsync();

            return Ok(progress);
        }

        [HttpPost("{lessonId:int}/result")]
        public async Task<IActionResult> SaveLessonResult(
            int lessonId,
            [FromBody] SaveLessonResultRequest request)
        {
            if (!TryGetCurrentUserId(out var userId))
            {
                return Unauthorized();
            }

            if (request.Answers == null || request.Answers.Count == 0)
            {
                return BadRequest(new { message = "Kết quả bài kiểm tra không hợp lệ." });
            }

            var lesson = await _context.Lessons
                .AsNoTracking()
                .Where(item => item.Id == lessonId)
                .Select(item => new
                {
                    item.Id,
                    item.HSKLevelId,
                    item.OrderIndex
                })
                .FirstOrDefaultAsync();

            if (lesson == null)
            {
                return NotFound(new { message = "Không tìm thấy bài học." });
            }

            var previousLessonId = await _context.Lessons
                .Where(item =>
                    item.HSKLevelId == lesson.HSKLevelId &&
                    item.OrderIndex < lesson.OrderIndex)
                .OrderByDescending(item => item.OrderIndex)
                .Select(item => (int?)item.Id)
                .FirstOrDefaultAsync();

            if (previousLessonId.HasValue)
            {
                var previousLessonCompleted = await _context.UserLessons
                    .AnyAsync(item =>
                        item.UserId == userId &&
                        item.LessonId == previousLessonId.Value &&
                        item.IsCompleted);

                if (!previousLessonCompleted)
                {
                    return Conflict(new
                    {
                        message = "Hãy đạt ít nhất 80% bài học trước."
                    });
                }
            }

            var vocabularies = await _context.Vocabularies
                .AsNoTracking()
                .Where(item => item.LessonId == lessonId)
                .Select(item => new
                {
                    item.Id,
                    item.WordSimplified,
                    item.Meaning,
                    item.Pinyin
                })
                .ToListAsync();

            if (vocabularies.Count == 0 ||
                request.Answers.Count != vocabularies.Count ||
                request.Answers.Select(answer => answer.VocabularyId).Distinct().Count()
                    != vocabularies.Count ||
                request.Answers.Any(answer =>
                    answer == null ||
                    string.IsNullOrWhiteSpace(answer.Meaning) ||
                    string.IsNullOrWhiteSpace(answer.Word) ||
                    string.IsNullOrWhiteSpace(answer.Pinyin) ||
                    vocabularies.All(vocabulary =>
                        vocabulary.Id != answer.VocabularyId)))
            {
                return BadRequest(new
                {
                    message = "Hãy trả lời mỗi từ trong bài đúng một lần."
                });
            }

            var correctAnswers = request.Answers.Count(answer =>
            {
                var vocabulary = vocabularies.First(
                    item => item.Id == answer.VocabularyId);

                return string.Equals(
                           answer.Meaning.Trim(),
                           vocabulary.Meaning.Trim(),
                           StringComparison.OrdinalIgnoreCase) &&
                       string.Equals(
                           answer.Word.Trim(),
                           vocabulary.WordSimplified.Trim(),
                           StringComparison.OrdinalIgnoreCase) &&
                       NormalizePinyin(answer.Pinyin) ==
                           NormalizePinyin(vocabulary.Pinyin);
            });
            var totalQuestions = vocabularies.Count;
            var passed = (double)correctAnswers / totalQuestions >= 0.8;
            var score = (int)Math.Round(
                (double)correctAnswers / totalQuestions * 100);

            var progress = await _context.UserLessons
                .FirstOrDefaultAsync(item =>
                    item.UserId == userId && item.LessonId == lessonId);

            if (progress == null)
            {
                progress = new UserLesson
                {
                    UserId = userId,
                    LessonId = lessonId
                };
                _context.UserLessons.Add(progress);
            }

            if (passed)
            {
                progress.IsCompleted = true;
                progress.CompletedAt ??= DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                lessonId,
                score,
                correctAnswers,
                totalQuestions,
                passed,
                progress.IsCompleted,
                progress.CompletedAt
            });
        }

        private static string NormalizePinyin(string value)
        {
            return string.Join(
                " ",
                value.Trim().ToLowerInvariant().Split(
                    (char[]?)null,
                    StringSplitOptions.RemoveEmptyEntries));
        }
    }
}
