const Sequelize = require('sequelize');
const data = require('./data_1.json');


///////////////////////////////////////////////////////////////
/*
กรณีที่ แยก JSON เป็น 3 ไฟล์
const booksData = require('./books.json'); 
const usersData = require('./users.json');
const borrowingsData = require('./borrowings.json');
*/

///////////////////////////////////////////////////////////////


// 1. นำ timestamps: false มาตั้งเป็น Global
const sequelize = new Sequelize({
  dialect: 'sqlite', storage: './backend/library.sqlite', logging: false, define: { timestamps: false }
});

// 2. ตัดการประกาศ id ทิ้ง เพราะ Sequelize สร้าง id (Primary Key) ให้อัตโนมัติ
const Book = sequelize.define('books', { title: Sequelize.STRING, price: Sequelize.FLOAT, authorId: Sequelize.INTEGER,genreId:Sequelize.INTEGER });
const Cate = sequelize.define('categories', { name: Sequelize.STRING});
const Autor = sequelize.define('authors', {name: Sequelize.STRING});

// 3. จัดกลุ่ม Relations ให้อยู่ในบรรทัดเดียวกัน
Book.belongsTo(Cate, { foreignKey: 'genreId' }); Cate.hasMany(Book, { foreignKey: 'genreId' });
Book.belongsTo(Autor, { foreignKey: 'authorId' }); Autor.hasMany(Book, { foreignKey: 'authorId' });

// 4. ใช้ IIFE (ฟังก์ชันรันตัวเอง) พร้อมต่อ .catch() และ .finally() แทน try...catch
(async () => {
  await sequelize.sync({ force: true });
  await Cate.bulkCreate(data.categories);
  await Autor.bulkCreate(data.authors);
  await Book.bulkCreate(data.books); // ควรสร้าง Borrowing ทีหลังสุด เพื่อป้องกันปัญหา Foreign Key
  console.log("✅ Seed Complete");
})().catch(console.error).finally(() => process.exit());

///////////////////////////////////////////////////////////////
/*w
4. กรณีที่ แยก JSON เป็น 3 ไฟล์
(async () => {
  await sequelize.sync({ force: true });
  
  // เรียกใช้ตัวแปรที่ require มาแทน
  await Book.bulkCreate(booksData);
  await User.bulkCreate(usersData);
  await Borrowing.bulkCreate(borrowingsData); 
  
  console.log("Seed Complete");
})().catch(console.error).finally(() => process.exit());
*/
///////////////////////////////////////////////////////////////