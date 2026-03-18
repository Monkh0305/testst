const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const BASE_URL = "http://localhost:3000";

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// ======================
// หน้าแรก (แสดงรายการหนังสือทั้งหมด)
// ======================
app.get('/', async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/books`);
        res.render('index', { books: response.data });
    } catch (error) {
        res.send('Error Loading Books: ' + error.message);
    }
});

// ======================
// หน้าเพิ่มหนังสือ (CREATE)
// ======================
app.get('/create', async (req, res) => {
    try {
        // ดึงข้อมูลผู้แต่งและหมวดหมู่มาทำ Dropdown ให้เลือก
        const authors = await axios.get(`${BASE_URL}/authors`);
        const categories = await axios.get(`${BASE_URL}/categories`);
        
        res.render('create', { 
            authors: authors.data, 
            categories: categories.data 
        });
    } catch (error) {
        res.send('Error Loading Form: ' + error.message);
    }
});

app.post('/create', async (req, res) => {
    try {
        // ส่งข้อมูลไปยัง API ของ Backend
        await axios.post(`${BASE_URL}/books`, req.body);
        res.redirect('/');
    } catch (error) {
        res.send('Error Creating Book: ' + error.message);
    }
});

// ======================
// หน้าดูรายละเอียด (VIEW)
// ======================
app.get('/view/:id', async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/books/${req.params.id}`);
        res.render('view', { book: response.data });
    } catch (error) {
        res.send('Error Loading View: ' + error.message);
    }
});

// ======================
// หน้าแก้ไขหนังสือ (EDIT)
// ======================
// ======================
// หน้าแก้ไขหนังสือ (EDIT)
// ======================
app.get('/edit/:id', async (req, res) => {
    try {
        const bookReq = await axios.get(`${BASE_URL}/books/${req.params.id}`);
        const authorsReq = await axios.get(`${BASE_URL}/authors`);
        const categoriesReq = await axios.get(`${BASE_URL}/categories`);
        
        // 🚨 เปลี่ยนตรงนี้จาก 'edit' เป็น 'update'
        res.render('update', { 
            book: bookReq.data,
            authors: authorsReq.data, 
            categories: categoriesReq.data 
        });
    } catch (error) {
        res.send('Error Loading Edit Form: ' + error.message);
    }
});

app.post('/edit/:id', async (req, res) => {
    try {
        await axios.put(`${BASE_URL}/books/${req.params.id}`, req.body);
        res.redirect('/');
    } catch (error) {
        res.send('Error Updating Book: ' + error.message);
    }
});

// ======================
// หน้า Report (กรองตามหมวดหมู่)
// ======================
app.get('/report', async (req, res) => {
    try {
        // รับค่า genreId ที่ส่งมาจากการกดปุ่มค้นหาในหน้าเว็บ (ถ้าไม่มีค่าจะว่างเปล่า)
        const filterGenreId = req.query.genreId || "";

        // ดึงข้อมูลหนังสือและหมวดหมู่ทั้งหมดมาจาก Backend
        const booksReq = await axios.get(`${BASE_URL}/books`);
        const categoriesReq = await axios.get(`${BASE_URL}/categories`);

        let filteredBooks = booksReq.data;

        // ถ้ามีการเลือกหมวดหมู่มา ให้ทำการกรอง (Filter) ข้อมูลหนังสือ
        if (filterGenreId !== "") {
            filteredBooks = filteredBooks.filter(b => b.genreId == filterGenreId);
        }

        // ส่งข้อมูลไปให้หน้า report.ejs แสดงผล
        res.render('report', {
            books: filteredBooks,
            categories: categoriesReq.data,
            selectedGenre: filterGenreId
        });
    } catch (error) {
        res.send('Error Loading Report: ' + error.message);
    }
});

// ======================
// ลบหนังสือ (DELETE)
// ======================
app.get('/delete/:id', async (req, res) => {
    try {
        await axios.delete(`${BASE_URL}/books/${req.params.id}`);
        res.redirect('/');
    } catch (error) {
        res.send('Error Deleting Book: ' + error.message);
    }
});

app.listen(5000, () => console.log('🌐 Frontend รันอยู่ที่ http://localhost:5000'));