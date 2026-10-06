namespace backend.Entities
{
    public class Role
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty; // Admin, User, Contributor
        public ICollection<User> Users { get; set; } = new List<User>();
    }
}