const Progress = () => {
  return (
    <div>
      <h1>Tiến độ học tập</h1>
      <p>Đây là trang theo dõi tiến độ học tập.</p>

      <p>HSK 1</p>
      <progress value="60" max="100"></progress>
      <span> 60%</span>

      <p>Từ vựng</p>
      <progress value="80" max="100"></progress>
      <span> 80%</span>

      <p>Ngữ pháp</p>
      <progress value="40" max="100"></progress>
      <span> 40%</span>
    </div>
  );
};

export default Progress;