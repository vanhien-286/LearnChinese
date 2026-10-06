using backend.Data;
using backend.Controllers;
using backend.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class LessonController : ControllerBase
    {
        private readonly AppDbContext _context;
        public LessonController(AppDbContext context)
        {
            _context = context;
        }
        [HttpGet]

        public async Task<IActionResult> GetAllLessons()
        {
            var lesson = await _context.Lessons.ToListAsync();
            if (lesson == null)
            {
                return NotFound();
            }
            return Ok(lesson);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetLessonById(int id)
        {
            var lesson = await _context.Lessons.FindAsync(id);
            if (lesson == null)
            {
                return NotFound();
            }
            return Ok(lesson);
        }
        [HttpGet("level/{levelId:int}")]
        public async Task<IActionResult> GetLessonsByLevel(int levelId)
        {
            var exists = await _context.HSKLevels.AnyAsync(l => l.Id == levelId);
            if (!exists)
            {
                return NotFound(new
                { message = $"Không tìm thấy cấp độ HSK với ID {levelId}." });
            }
            var lessons = await _context.Lessons
                .AsNoTracking()
                .Where(l => l.HSKLevelId == levelId)
                .OrderBy(l => l.OrderIndex)
                .Select(l => new
                {
                    l.Id,
                    l.Title,
                    l.OrderIndex,
                    l.Description,
                    l.HSKLevelId,
                    VocabularyCound = l.Vocabularies.Count()
                })
                .ToListAsync();
            return Ok(lessons);
        }
    }
}