using System.ComponentModel.DataAnnotations;
namespace backend.DTOs
{
    public class RegisterRequest
    {
        [Required(ErrorMessage = "Tên người dùng không được để trống.")]
        [StringLength(50)]
        public string Username { get; set; } = string.Empty;
        [Required(ErrorMessage = "Email không được để trống.")]
        [EmailAddress(ErrorMessage = "Định dạng email không hợp lệ.")]
        public string Email { get; set; } = string.Empty;
        [Required(ErrorMessage = "Mật khẩu không được để trống.")]
        [StringLength(100, MinimumLength = 8, ErrorMessage = "Mật khẩu phải có độ dài từ 8 đến 100 ký tự.")]
        public string Password { get; set; } = string.Empty;
    }
}