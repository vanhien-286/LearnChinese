using backend.Data;
using backend.DTOs;
using backend.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class VocabularyController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VocabularyController(AppDbContext context)
        {
            _context = context;
        }

        private static VocabularyResponseDto ToResponseDto(Vocabulary vocabulary)
        {
            return new VocabularyResponseDto
            {
                Id = vocabulary.Id,
                WordSimplified = vocabulary.WordSimplified,
                WordTraditional = vocabulary.WordTraditional,
                Pinyin = vocabulary.Pinyin,
                PartOfSpeech = vocabulary.PartOfSpeech,
                Meaning = vocabulary.Meaning,
                AudioUrl = vocabulary.AudioUrl,
                ExampleSentence = vocabulary.ExampleSentence,
                ExamplePinyin = vocabulary.ExamplePinyin,
                ExampleMeaning = vocabulary.ExampleMeaning,
                LessonId = vocabulary.LessonId
            };
        }

        [HttpGet]
        public async Task<IActionResult> GetAllVocabularies(int page = 1, int pageSize = 20)
        {
            if (page < 1 || pageSize < 1 || pageSize > 100)
            {
                return BadRequest("Tham số phân trang không hợp lệ.");
            }
            var query = _context.Vocabularies
                .AsNoTracking()
                .OrderBy(v => v.Id);

            var totalItems = await query.CountAsync();

            var vocabularies = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new
            {
                page,
                pageSize,
                totalItems,
                totalPages = (int)Math.Ceiling((double)totalItems / pageSize),
                data = vocabularies.Select(ToResponseDto)
            });
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetVocabularyById(int id)
        {
            var vocabulary = await _context.Vocabularies
                .AsNoTracking()
                .FirstOrDefaultAsync(v => v.Id == id);
            if (vocabulary == null)
            {
                return NotFound(new
                {
                    message = $"Không tìm thấy từ vựng với ID {id}."
                });
            }
            return Ok(ToResponseDto(vocabulary));
        }
        [HttpGet("level/{levelId}")]
        public async Task<IActionResult> GetVocabulariesByLevelId(int levelId)
        {
            var exists = await _context.HSKLevels.AnyAsync(h => h.Id == levelId);
            if (!exists)
            {
                return NotFound(new
                {
                    message = $"Không tìm thấy cấp độ HSK với ID {levelId}."
                });
            }
            var vocabularies = await _context.Vocabularies
                .AsNoTracking()
                .Where(v => v.Lesson.HSKLevelId == levelId)
                .OrderBy(v => v.Lesson.OrderIndex)
                .ThenBy(v => v.Id)
                .ToListAsync();
            return Ok(vocabularies.Select(ToResponseDto));
        }
        [HttpGet("lesson/{lessonId}")]
        public async Task<IActionResult> GetVocabulariesBylessonId(int lessonId)
        {
            var exists = await _context.Lessons.AnyAsync(l => l.Id == lessonId);
            if (!exists)
            {
                return NotFound(new
                {
                    message = $"Không tìm thấy bài học với ID {lessonId}."
                });
            }
            var vocabularies = await _context.Vocabularies
                .AsNoTracking()
                .Where(v => v.LessonId == lessonId)
                .OrderBy(v => v.Id)
                .ToListAsync();
            return Ok(vocabularies.Select(ToResponseDto));
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateVocabulary([FromBody] Vocabulary vocabulary)
        {
            _context.Vocabularies.Add(vocabulary);
            await _context.SaveChangesAsync();
            return CreatedAtAction(
                nameof(GetVocabularyById),
                new { id = vocabulary.Id },
                ToResponseDto(vocabulary));
        }
        [HttpGet("search")]
        public async Task<IActionResult> SearchVocabularies([FromQuery] string keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword))
            {
                return BadRequest(new
                {
                    message = "Từ khóa tìm kiếm không được để trống."
                });
            }
            keyword = keyword.Trim();
            var vocabularies = await _context.Vocabularies
                .AsNoTracking()
                .Where(v =>
                    (v.WordSimplified != null && v.WordSimplified.Contains(keyword)) ||
                    (v.WordTraditional != null && v.WordTraditional.Contains(keyword)) ||
                    (v.Pinyin != null && v.Pinyin.Contains(keyword)) ||
                    (v.Meaning != null && v.Meaning.Contains(keyword)))
                    .OrderBy(v => v.Id)
                    .Take(50)
                    .ToListAsync();
            return Ok(vocabularies.Select(ToResponseDto));


        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateVocabulary(int id, [FromBody] Vocabulary updatedVocabulary)
        {
            if (id != updatedVocabulary.Id)
            {
                return BadRequest(new
                {
                    message = "ID trong URL không khớp với ID trong dữ liệu gửi lên."
                });
            }

            var existingVocabulary = await _context.Vocabularies.FindAsync(id);
            if (existingVocabulary == null)
            {
                return NotFound(new
                {
                    message = $"Không tìm thấy từ vựng với ID {id}."
                });
            }

            // Cập nhật các thuộc tính
            existingVocabulary.WordSimplified = updatedVocabulary.WordSimplified;
            existingVocabulary.WordTraditional = updatedVocabulary.WordTraditional;
            existingVocabulary.Pinyin = updatedVocabulary.Pinyin;
            existingVocabulary.PartOfSpeech = updatedVocabulary.PartOfSpeech;
            existingVocabulary.Meaning = updatedVocabulary.Meaning;
            existingVocabulary.AudioUrl = updatedVocabulary.AudioUrl;
            existingVocabulary.ExampleSentence = updatedVocabulary.ExampleSentence;
            existingVocabulary.ExamplePinyin = updatedVocabulary.ExamplePinyin;
            existingVocabulary.ExampleMeaning = updatedVocabulary.ExampleMeaning;
            existingVocabulary.LessonId = updatedVocabulary.LessonId;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVocabulary(int id)
        {
            var vocabulary = await _context.Vocabularies.FindAsync(id);
            if (vocabulary == null)
            {
                return NotFound(new
                {
                    message = $"Không tìm thấy từ vựng với ID {id}."
                });
            }
            _context.Vocabularies.Remove(vocabulary);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
