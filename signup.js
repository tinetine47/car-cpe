const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const mysql = require('mysql')
const bcrypt = require('bcrypt');



const app = express();
const port = 3000 ;

const pool = mysql.createPool({
    host:'localhost',
    user: 'root',
    database: 'carmodels',
    waiForconnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection((err, connection) => {
    if (err){
        console.error('Error connecting to Mysql',err);

    }else {
        console.log('Connected to Mysql')  
     }
});
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(cors());

app.get('/',(req, res)=> {
    res.sendFile(path.join(__dirname, 'sigup.html'));
});

app.post('/register',(req, res )=>{
    const {username, email, password_1, password_2 } = req.body;

    console.log(`Received data: ${JSON.stringify(username)}`); 
    
    if(username && email && password_1&& password_2 && password_1===password_2){
        bcrypt.hash(password_1, 10, (err, hashedPassword) => {

            if (err) {
                console.error('เกิดข้อผิดพลาดในการแปลงรหัสผ่าน: ', err);
                return res.status(500).send('เกิดข้อผิดพลาดในการสร้างบัญชี');
            }

    // สร้างคำสั่ง SQL INSERT
    const insertQuery ='INSERT INTO signup (username, email, password) VALUES (?, ?, ?)';
        pool.query(insertQuery, [username, email, hashedPassword ], (err, result) => {
            if (err) {
                console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ',err)
                 return res.status(500).send('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
            } else {
                console.log('บันทึกข้อมูลลงในตาราง mysql สำเร็จ:', result);
                res.send('สมัคสมาชิกสำเร็จ');
            }
            });

        });

        } else if (password_1 !== password_2) {
            res.send( 'ERROR รหัสผ่านไม่ตรงกัน ');
        } else {
            res.send( 'ERROR ข้อมูลไม่ครบถ้วน ');
        }
});

app.listen(port, ()=>{
    console.log(` Server is running at http://localhost:${port}`);
});