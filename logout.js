const express = require('express');
const session = require('express-session');
const mysql = require('mysql');


const app = express();
const port = 3000;

app.use(session({
    secret: 'secret_key', // คีย์สำหรับเข้ารหัส session
    resave: true,
    saveUninitialized: true
}));

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'carmodels',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.get('/', (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(__dirname + '/home.html');
    } else {
        res.sendFile(__dirname + '/login.html');
    }
});

// เมื่อล็อกอินสำเร็จ ให้ redirect ไปยังหน้า Home
app.post('/login', (req, res) => {
    // ตรวจสอบการล็อกอินและตั้งค่า session ตามต้องการ
    req.session.loggedin = true;
    res.redirect('/');
});

// ออกจากระบบ (Logout)
app.get('/logout', (req, res) => {
    // ตรวจสอบว่าผู้ใช้เข้าสู่ระบบอยู่หรือไม่
    if (req.session.loggedin) {
        // ลบ session
        req.session.destroy((err) => {
            if (err) {
                console.error('เกิดข้อผิดพลาดในการลบ session: ', err);
                res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบ session' });
                return;
            }
            // ลบข้อมูลการเข้าสู่ระบบออกจากฐานข้อมู
            const deleteLoginQuery = 'DELETE FROM login WHERE username = ?';
            pool.query(deleteLoginQuery, [req.session.username], (err, result) => {
                if (err) {
                    console.error('เกิดข้อผิดพลาดในการลบข้อมูลการเข้าสู่ระบบ: ', err);
                    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบข้อมูลการเข้าสู่ระบบ' });
                    return;
                }
                console.log('ลบข้อมูลการเข้าสู่ระบบออกจากฐานข้อมูลสำเร็จ:', result);
                res.redirect('/'); // หลังจากลบ session และข้อมูลเข้าสู่ระบบ ให้ redirect ไปยังหน้าหลัก
            });
        });
    } else {
        res.redirect('/'); // ถ้าไม่ได้เข้าสู่ระบบ ก็ให้ redirect ไปยังหน้าหลักเลย
    }
});
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
}); 