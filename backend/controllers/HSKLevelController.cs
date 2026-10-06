using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class HSKLevelController : ControllerBase
    {
        private readonly AppDbContext _context;
        public HSKLevelController(AppDbContext context)
        {
            _context = context;
        }
        [HttpGet]
        public async Task<IActionResult> GetAllLevels()
        {
            var levels = await _context.HSKLevels
                .OrderBy(l => l.Id)
                .Select(l => new
                {
                    l.Id,
                    l.Title
                })
                .ToListAsync();
            return Ok(levels);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetLevelById(int id)
        {
            var level = await _context.HSKLevels
                .Where(l => l.Id == id)
                .Select(l => new
                {
                    l.Id,
                    l.Title
                })
                .FirstOrDefaultAsync();

            if (level == null)
            {
                return NotFound(new
                { message = $"Không tìm thấy cấp độ HSK với ID {id}." });
            }

            return Ok(level);
        }
    }
}