using backend.Data;
using backend.DTOs;
using backend.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;
namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IPasswordHasher<User> _passwordHasher;
        public UserController(AppDbContext context,
         IConfiguration configuration, IPasswordHasher<User> passwordHasher)
        {
            _context = context;
            _configuration = configuration;
            _passwordHasher = passwordHasher;
        }

        // Các endpoint liên quan đến người dùng sẽ được định nghĩa ở đây
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var email = request.Email.Trim().ToLowerInvariant();
            var username = request.Username.Trim();
            var emailExists = await _context.Users.AnyAsync(u => u.Email == email);
            if (emailExists)
            {
                return BadRequest(new { message = "Email đã được sử dụng." });
            }

            var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "User");

            if (role == null)
            {
                return BadRequest(new { message = "Chưa cấu hình vai trò user" });
            }

            var user = new User
            {
                Username = username,
                Email = email,
                RoleId = role.Id,
                CreatedAt = DateTime.UtcNow,
            };

            user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            // Logic cho việc đăng ký người dùng
            return StatusCode(201, new
            {
                message = "Đăng ký thành công.",
                user = new
                {
                    user.Id,
                    user.Username,
                    user.Email,
                    user.CreatedAt
                }
            });
        }



        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var email = request.Email.Trim().ToLowerInvariant();
            var user = await _context.Users.Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                return BadRequest(new { message = "Email hoặc mật khẩu không đúng." });
            }


            var result = _passwordHasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                request.Password
            );

            if (result == PasswordVerificationResult.Failed)
            {
                return BadRequest(new { message = "Email hoặc mật khẩu không đúng." });
            }

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role.Name)
            };

            var key = _configuration["Jwt:SecretKey"];
            var issuer = _configuration["Jwt:Issuer"];
            var audience = _configuration["Jwt:Audience"];

            if (string.IsNullOrWhiteSpace(key) || string.IsNullOrWhiteSpace(issuer) || string.IsNullOrWhiteSpace(audience))
            {
                return StatusCode(500, new { message = "Cấu hình JWT không hợp lệ." });
            }
            if (Encoding.UTF8.GetByteCount(key) < 32)
            {
                return StatusCode(500, new { message = "Khóa bí mật JWT phải có ít nhất 32 ký tự." });
            }

            //  biến chuỗi key thành một mảng byte bằng cách sử dụng mã hóa UTF-8. Sau đó, mảng byte này được sử dụng để tạo một đối tượng SymmetricSecurityKey, đại diện cho khóa bảo mật đối xứng được sử dụng để ký và xác thực JWT.
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            //tạo một đối tượng SigningCredentials, đại diện cho thông tin xác thực ký của JWT. Nó sử dụng khóa bảo mật đối xứng (securityKey) và thuật toán HMAC-SHA256 để ký JWT. 
            var credentials = new SigningCredentials(
                securityKey, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: credentials
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
            return Ok(
                new
                {
                    message = "Đăng nhập thành công.",
                    token = tokenString,
                    expires = token.ValidTo,
                    user = new
                    {
                        user.Id,
                        user.Username,
                        user.Email,
                        user.Role.Name
                    }
                }
            );
        }

        [Authorize(Roles = "Admin,User")]
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userId, out int id))
            {
                return Unauthorized(new { message = "Token không hợp lệ." });
            }

            var user = await _context.Users
                .Include(u => u.Role)
                .Where(u => u.Id == id)
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.Email,
                    Role = u.Role.Name,
                    u.CreatedAt
                })
                .FirstOrDefaultAsync();
            if (user == null)
            {
                return NotFound(new { message = "Người dùng không tồn tại." });
            }

            return Ok(user);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("all")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Include(u => u.Role)
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.Email,
                    Role = u.Role.Name,
                    u.CreatedAt
                })
                .ToListAsync();
            return Ok(users);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin-test")]
        public IActionResult AdminTest()
        {
            return Ok(new
            {
                message = "Bạn đang truy cập bằng tài khoản Admin."
            });
        }
    }
}