const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Định nghĩa đường dẫn lưu dữ liệu
const dataDir = path.join(__dirname, 'data');
const notesDir = path.join(dataDir, 'notes');
const profilePath = path.join(dataDir, 'profile.json');
const privateNotesFile = path.join(dataDir, 'private.json');

// Khởi tạo thư mục và file mặc định nếu chưa tồn tại (đạt chuẩn Sprint 4)
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(notesDir)) fs.mkdirSync(notesDir, { recursive: true });
if (!fs.existsSync(profilePath)) {
  fs.writeFileSync(
    profilePath,
    JSON.stringify({ displayName: "Sinh viên", theme: "light", password: "" }, null, 2),
    'utf8'
  );
}
if (!fs.existsSync(privateNotesFile)) {
  fs.writeFileSync(privateNotesFile, '[]', 'utf8');
}

const getFilePath = (topic) => path.join(notesDir, `${topic}.json`);

/* ============================================================================
 * SPRINT 1: CẤU HÌNH CÁ NHÂN (PROFILE)
 * ============================================================================ */

// Đọc thông tin Profile
app.get('/api/profile', (req, res) => {
  try {
    const rawData = fs.readFileSync(profilePath, 'utf8');
    res.json(JSON.parse(rawData));
  } catch (error) {
    res.status(500).json({ message: "Lỗi đọc file profile" });
  }
});

// Cập nhật Profile
app.put('/api/profile', (req, res) => {
  try {
    const newProfile = req.body;
    fs.writeFileSync(profilePath, JSON.stringify(newProfile, null, 2), 'utf8');
    res.json({ success: true, message: "Đã cập nhật Profile" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi ghi file profile" });
  }
});

/* ============================================================================
 * SPRINT 2: GHI CHÚ THÔNG THƯỜNG (PUBLIC NOTES)
 * ============================================================================ */

// Lấy danh sách ghi chú theo topic
app.get('/api/notes/:topic', (req, res) => {
  const filePath = getFilePath(req.params.topic);
  try {
    if (!fs.existsSync(filePath)) return res.json([]);
    const data = fs.readFileSync(filePath, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ message: "Lỗi đọc danh sách ghi chú" });
  }
});

// Thêm ghi chú mới
app.post('/api/notes/:topic', (req, res) => {
  const filePath = getFilePath(req.params.topic);
  try {
    let notes = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : [];
    const newNote = {
      id: Date.now().toString(),
      title: req.body.title || "Không tiêu đề",
      content: req.body.content || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    notes.push(newNote);
    fs.writeFileSync(filePath, JSON.stringify(notes, null, 2), 'utf8');
    res.json({ success: true, note: newNote });
  } catch (error) {
    res.status(500).json({ message: "Lỗi thêm ghi chú" });
  }
});

// Chỉnh sửa ghi chú
app.put('/api/notes/:topic/:id', (req, res) => {
  const filePath = getFilePath(req.params.topic);
  try {
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: "Không tìm thấy file ghi chú" });
    let notes = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const index = notes.findIndex(n => n.id === req.params.id);
    if (index !== -1) {
      notes[index].title = req.body.title;
      notes[index].content = req.body.content;
      notes[index].updatedAt = new Date().toISOString();
      fs.writeFileSync(filePath, JSON.stringify(notes, null, 2), 'utf8');
      return res.json({ success: true, message: "Đã sửa thành công" });
    }
    res.status(404).json({ message: "Không tìm thấy ghi chú" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật ghi chú" });
  }
});

// Xóa ghi chú
app.delete('/api/notes/:topic/:id', (req, res) => {
  const filePath = getFilePath(req.params.topic);
  try {
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: "Không tìm thấy file ghi chú" });
    let notes = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const newNotes = notes.filter(n => n.id !== req.params.id);
    fs.writeFileSync(filePath, JSON.stringify(newNotes, null, 2), 'utf8');
    res.json({ success: true, message: "Đã xóa thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa ghi chú" });
  }
});

/* ============================================================================
 * SPRINT 3: XÁC THỰC & GHI CHÚ RIÊNG TƯ (PRIVATE NOTES)
 * ============================================================================ */

// Kiểm tra mật khẩu
app.post('/api/private/auth', (req, res) => {
  try {
    const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
    if (profile.password === req.body.password) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: "Sai mật khẩu!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống xác thực" });
  }
});

// Lấy danh sách ghi chú riêng tư
app.get('/api/private/notes', (req, res) => {
  try {
    const data = fs.readFileSync(privateNotesFile, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ message: "Lỗi đọc ghi chú riêng tư" });
  }
});

// Thêm ghi chú riêng tư
app.post('/api/private/notes', (req, res) => {
  try {
    let notes = JSON.parse(fs.readFileSync(privateNotesFile, 'utf8'));
    const newNote = {
      id: Date.now().toString(),
      title: req.body.title || "Lưu bút mật",
      content: req.body.content || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    notes.push(newNote);
    fs.writeFileSync(privateNotesFile, JSON.stringify(notes, null, 2), 'utf8');
    res.json({ success: true, note: newNote });
  } catch (error) {
    res.status(500).json({ message: "Lỗi thêm ghi chú kín" });
  }
});

// Chỉnh sửa ghi chú riêng tư
app.put('/api/private/notes/:id', (req, res) => {
  try {
    let notes = JSON.parse(fs.readFileSync(privateNotesFile, 'utf8'));
    const index = notes.findIndex(n => n.id === req.params.id);
    if (index !== -1) {
      notes[index].title = req.body.title;
      notes[index].content = req.body.content;
      notes[index].updatedAt = new Date().toISOString();
      fs.writeFileSync(privateNotesFile, JSON.stringify(notes, null, 2), 'utf8');
      return res.json({ success: true, message: "Đã sửa thành công" });
    }
    res.status(404).json({ message: "Không tìm thấy ghi chú" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật ghi chú kín" });
  }
});

// Xóa ghi chú riêng tư
app.delete('/api/private/notes/:id', (req, res) => {
  try {
    let notes = JSON.parse(fs.readFileSync(privateNotesFile, 'utf8'));
    const newNotes = notes.filter(n => n.id !== req.params.id);
    fs.writeFileSync(privateNotesFile, JSON.stringify(newNotes, null, 2), 'utf8');
    res.json({ success: true, message: "Đã xóa thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa ghi chú kín" });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server Backend đang chạy tại port ${PORT}`);
});