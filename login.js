const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');





const app = express();
const port= 3000;
const saltRounds = 10;

const pool = mysql.createPool({
    host:'localhost',
    user: 'root',
    database: 'carmodels',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.get('/',(req, res)=> {
    res.sendFile(path.join(__dirname, 'login.html'));
});


app.post('/login', (req, res) => {
    const { username, password } = req.body;

    console.log(`Received data: ${JSON.stringify(username)}`);

    if (username && password) {
        const selectQuery = 'SELECT * FROM signup WHERE username = ?';
        pool.query(selectQuery, [username], (err, result) => {
            if (err) {
                console.error('ไม่สามารถเชื่อมต่อกับฐานข้อมูลได้', err);
                return res.status(500).send('ไม่สามารถเชื่อมต่อกับฐานข้อมูลได้');
            } 
    
            if (result.length > 0) {
                const hashedPasswordInDB = result[0].password;
                bcrypt.compare(password, hashedPasswordInDB, (err, bcryptResult) => {
                    if (err) {
                        console.error('เกิดข้อผิดพลาดในการเปรียบเทียบรหัสผ่าน', err);
                        return res.status(500).send('เกิดข้อผิดพลาดในการเปรียบเทียบรหัสผ่าน');
                    }
    
                // บันทึกการเข้าสู่ระบบลงในฐานข้อมูล
                const insertLoginQuery = 'INSERT INTO login (username, password) VALUES (?,?)';
                            pool.query(insertLoginQuery, [username,hashedPasswordInDB], (err, loginResult) => {
                                if (err) {
                                    console.error('เกิดข้อผิดพลาดในการบันทึกการเข้าสู่ระบบ: ', err);
                                    return res.status(500).send('เกิดข้อผิดพลาดในการบันทึกการเข้าสู่ระบบ');
                                }
    
                                console.log('บันทึกการเข้าสู่ระบบลงในฐานข้อมูลสำเร็จ:', loginResult);
                                res.send('เข้าสู่ระบบสำเร็จ');
                            });
                });
            } else {
                res.send('ไม่พบชื่อผู้ใช้ในฐานข้อมูล');
            }
        });
    } else {
        res.send('ERROR ข้อมูลไม่ครบถ้วน');
    }

});
app.listen(port, ()=>{
    console.log(` Server is running at http://localhost:${port}`);
});
