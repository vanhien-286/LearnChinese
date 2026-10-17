using System.Security.Claims;
using backend.Data;
using backend.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.DTOs;
namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]

    public class UserFlashcardController : ControllerBase
    {
        private readonly AppDbContext _context;
        public UserFlashcardController(AppDbContext context)
        {
            _context = context;
        }

        private int GetCurrentUserId()
        {
            return int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!
            );
        }

        [HttpPost("{vocabularyId}")]

        public async Task<IActionResult> AddFlashcard(int vocabularyId)
        {
            var userId = GetCurrentUserId();

            var vocabulary = await _context.Vocabularies.FirstOrDefaultAsync(v => v.Id == vocabularyId);
            if (vocabulary == null)
            {
                return NotFound(new
                {
                    message = "không tìm thấy từ vựng"
                });

            }

            var ExistingFlahcard = await _context.UserFlashcards
            .FirstOrDefaultAsync(f => f.UserId == userId && f.VocabularyId == vocabularyId);

            if (ExistingFlahcard != null)
            {
                return BadRequest(new
                {
                    message = "từ này đã được thêm"
                });
            }

            var flashcard = new UserFlashcard
            {
                UserId = userId,
                VocabularyId = vocabularyId
            };

            _context.UserFlashcards.Add(flashcard);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "đã thêm từ vào flashcard.",
                FlashcardId = flashcard.Id

            });
        }


        [HttpGet]
        public async Task<ActionResult<List<UserFlashcardResponseDto>>>
            GetMyFlashcard()
        {
            var userId = GetCurrentUserId();

            var flashcards = await _context.UserFlashcards
                .AsNoTracking()
                .Where(f => f.UserId == userId)
                .OrderBy(f => f.NextReviewDate)
                .Select(f => new UserFlashcardResponseDto
                {
                    Id = f.Id,
                    VocabularyId = f.VocabularyId,
                    Interval = f.Interval,
                    EaseFactor = f.EaseFactor,
                    Repetitions = f.Repetitions,
                    NextReviewDate = f.NextReviewDate,

                    Vocabulary = f.Vocabulary == null
                        ? null
                        : new VocabularyResponseDto
                        {
                            Id = f.Vocabulary.Id,
                            WordSimplified =
                                f.Vocabulary.WordSimplified,
                            WordTraditional =
                                f.Vocabulary.WordTraditional,
                            Pinyin = f.Vocabulary.Pinyin,
                            Meaning = f.Vocabulary.Meaning,
                            ExampleSentence =
                                f.Vocabulary.ExampleSentence,
                            ExampleMeaning =
                                f.Vocabulary.ExampleMeaning
                        }
                })
                .ToListAsync();

            return Ok(flashcards);
        }


        [HttpDelete("{vocabularyId}")]
        public async Task<IActionResult> RemoveFlashcard(int vocabularyId)
        {
            var userId = GetCurrentUserId();

            var flashcard = await _context.UserFlashcards
                .FirstOrDefaultAsync(f => f.UserId == userId &&
                f.VocabularyId == vocabularyId);

            if (flashcard == null)
            {
                return NotFound(new
                {
                    message = "từ này chưa có trong flashcard"
                });
            }

            _context.UserFlashcards.Remove(flashcard);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "đã xóa thành công"
            });
        }

        [HttpPost("{vocabularyId}/review")]

        public async Task<IActionResult> ReviewFlashcard(int vocabularyId, [FromBody] ReviewFlashcardRequest request)
        {
            var userId = GetCurrentUserId();

            if (request.Quality < 0 || request.Quality > 1)
            {
                return BadRequest(new
                {
                    message = "Điểm đánh giá phải từ 0 đến 1."
                });


            }

            var flashcard = await _context.UserFlashcards
                .FirstOrDefaultAsync(f => f.UserId == userId &&
                                f.VocabularyId == vocabularyId);


            if (flashcard == null)
            {
                return NotFound(new
                {
                    message = "không tìm thấy flashcard"
                });
            }

            int quality = request.Quality;
            if (quality == 0)
            {
                flashcard.Repetitions = 0;
                flashcard.Interval = 1;
            }
            else
            {
                if (flashcard.Repetitions == 0)
                {
                    flashcard.Interval = 1;
                }
                else if (flashcard.Repetitions == 1)
                {
                    flashcard.Interval = 2;
                }
                else
                {
                    flashcard.Interval = Math.Max(1, (int)Math.Round(
                        flashcard.Interval * flashcard.EaseFactor));
                }

                flashcard.Repetitions++;
            }

            flashcard.NextReviewDate = DateTime.UtcNow.AddDays(flashcard.Interval);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "đã cập nhật kết quả ôn tập",
                flashcard.Interval,
                flashcard.EaseFactor,
                flashcard.Repetitions,
                flashcard.NextReviewDate
            });
        }


    }
}