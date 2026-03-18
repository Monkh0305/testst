const express = require('express');
const { Sequelize } = require('sequelize');

const app = express();
app.use(express.json()); // ให้ API สามารถอ่านข้อมูลแบบ JSON ที่ส่งมาได้

// ==========================================
// 1. ตั้งค่า Database & Models
// ==========================================
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './backend/library.sqlite', // อ้างอิงไฟล์ db ที่เรา seed ไว้
  logging: false,
  define: { timestamps: false }
});

// ประกาศ Model
const Book = sequelize.define('books', { title: Sequelize.STRING, price: Sequelize.FLOAT, authorId: Sequelize.INTEGER,genreId:Sequelize.INTEGER });
const Cate = sequelize.define('categories', { name: Sequelize.STRING});
const Autor = sequelize.define('authors', {name: Sequelize.STRING});

// ==========================================
// 2. กำหนด Relations (ความสัมพันธ์ของตาราง)
// ==========================================
Book.belongsTo(Cate, { foreignKey: 'genreId' }); Cate.hasMany(Book, { foreignKey: 'genreId' });
Book.belongsTo(Autor, { foreignKey: 'authorId' }); Autor.hasMany(Book, { foreignKey: 'authorId' });

// ==========================================
// 3. API สำหรับหนังสือ (Books CRUD)
// ==========================================


// ==========================================
// สร้างหน้าแรก (Home URL)
// ==========================================
app.get('/', (req, res) => {
  res.send('welcome to database'); 
});


// [C] CREATE: สร้างหนังสือใหม่
app.post('/authors', async (req, res) => {
  try {
    const newBook = await Autor.create(req.body);
    res.status(201).json(newBook);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// [R] READ: ดึงข้อมูลหนังสือทั้งหมด
app.get('/authors', async (req, res) => {
  try {
    const books = await Autor.findAll();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// [R] READ: ดึงข้อมูลหนังสือตาม ID
app.get('/authors/:id', async (req, res) => {
  try {
    const book = await Autor.findByPk(req.params.id);
    if (!book) return res.status(404).json({ message: 'ไม่พบหนังสือนี้' });
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// [U] UPDATE: แก้ไขข้อมูลหนังสือ
app.put('/authors/:id', async (req, res) => {
  try {
    const book = await Autor.findByPk(req.params.id);
    if (!book) return res.status(404).json({ message: 'ไม่พบหนังสือนี้' });

    await book.update(req.body);
    res.json({ message: 'อัปเดตสำเร็จ', book });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// [D] DELETE: ลบข้อมูลหนังสือ
app.delete('/authors/:id', async (req, res) => {
  try {
    const book = await Autor.findByPk(req.params.id);
    if (!book) return res.status(404).json({ message: 'ไม่พบหนังสือนี้' });

    await book.destroy();
    res.json({ message: 'ลบข้อมูลสำเร็จ' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 3.5 API สำหรับผู้ใช้งาน (Users CRUD)
// ==========================================

// [C] CREATE: สร้างผู้ใช้ใหม่
app.post('/categories', async (req, res) => {
  try {
    // ส่ง JSON มาเช่น { "name": "สมหญิง", "email": "somying@email.com" }
    const newUser = await Cate.create(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// [R] READ: ดึงข้อมูลผู้ใช้ทั้งหมด
app.get('/categories', async (req, res) => {
  try {
    const users = await Cate.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// [R] READ: ดึงข้อมูลผู้ใช้ตาม ID
app.get('/categories/:id', async (req, res) => {
  try {
    const user = await Cate.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'ไม่พบผู้ใช้งานนี้' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// [U] UPDATE: แก้ไขข้อมูลผู้ใช้งาน
app.put('/categories/:id', async (req, res) => {
  try {
    const user = await Cate.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'ไม่พบผู้ใช้งานนี้' });

    await user.update(req.body);
    res.json({ message: 'อัปเดตข้อมูลผู้ใช้สำเร็จ', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// [D] DELETE: ลบข้อมูลผู้ใช้งาน
app.delete('/categories/:id', async (req, res) => {
  try {
    const user = await Cate.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'ไม่พบผู้ใช้งานนี้' });

    await user.destroy();
    res.json({ message: 'ลบข้อมูลผู้ใช้สำเร็จ' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 4. API สำหรับระบบยืม-คืน (Borrowings)
// ==========================================

// [READ] ดึงประวัติการยืมทั้งหมด (รวมข้อมูล User และ Book มาแสดงด้วย)
app.get('/books', async (req, res) => {
  try {
    const borrows = await Book.findAll({
      include: [Cate, Autor]
    });
    res.json(borrows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// [READ Single] ดึงข้อมูลหนังสือตาม ID (ใช้ในหน้า View และ Edit)
app.get('/books/:id', async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id, {
      include: [Cate, Autor] // ดึงข้อมูลหมวดหมู่และผู้แต่งมาด้วย
    });
    
    if (!book) return res.status(404).json({ message: 'ไม่พบหนังสือนี้' });
    
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// [C] CREATE: สร้างหนังสือใหม่
app.post('/books', async (req, res) => {
  try {
    // รับ authorName เป็นข้อความ และ genreId เป็นตัวเลขจาก Dropdown
    const { title, price, authorName, genreId } = req.body;

    // หาหรือสร้างผู้แต่งใหม่ (ถ้าไม่มีในระบบให้สร้าง)
    const [author] = await Autor.findOrCreate({ where: { name: authorName } });
    
    // บันทึกหนังสือลงฐานข้อมูล โดยเอา ID ของผู้แต่ง กับ genreId ที่เลือกมาใช้
    const newBook = await Book.create({
      title,
      price,
      authorId: author.id,
      genreId: genreId 
    });
    
    res.status(201).json(newBook);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// [U] UPDATE: แก้ไขข้อมูลหนังสือ
app.put('/books/:id', async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ message: 'ไม่พบหนังสือนี้' });

    // รับค่าที่แก้มา
    const { title, price, authorName, genreId } = req.body;

    // หาหรือสร้างผู้แต่งใหม่ เผื่อมีการเปลี่ยนชื่อผู้แต่ง
    const [author] = await Autor.findOrCreate({ where: { name: authorName } });

    // อัปเดตข้อมูล
    await book.update({ 
      title, 
      price, 
      authorId: author.id, 
      genreId: genreId 
    });
    
    res.json({ message: 'อัปเดตสำเร็จ', book });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// [D] DELETE: ลบข้อมูลหนังสือตาม ID
app.delete('/books/:id', async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'ไม่พบหนังสือที่ต้องการลบ' });
    }

    await book.destroy();
    res.json({ message: 'ลบข้อมูลหนังสือเรียบร้อยแล้ว' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 5. เริ่มรันเซิร์ฟเวอร์
// ==========================================
const PORT = 3000;
app.listen(PORT, async () => {
  // ใช้ sync() ธรรมดา ไม่ใส่ force: true เพื่อรักษาข้อมูลที่ Seed ไว้
  await sequelize.sync(); 
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});