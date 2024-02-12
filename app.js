const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const mysql = require('mysql')



const app = express();
const port = 3000 ;

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'user',
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
    res.sendFile(path.join(__dirname, 'information.html'));
});

app.post('/submit',(req, res )=>{
    const {username, firstname, lastname,phone,email,address,city } = req.body;

    // response.send(request.body);
    console.log(`Received data: ${JSON.stringify(req.body)}`); 
    
    if(username && email ){

        const selectQuery = 'SELECT * FROM signup WHERE username = ? AND email = ?';
        pool.query(selectQuery, [username, email], (err, result) => {
            if (err) {
                console.error('ข้อมูลไม่ถูกต้อง', err);
                return res.status(500).send('ข้อมูลไม่ถูกต้อง');
            } else {
                if (result.length > 0) {
                      console.log('บันทึกข้อมูลสำเร็จ:', result);

     // สร้างคำสั่ง SQL INSERT
        const insertQuery ='INSERT INTO customer (username,firstname, lastname, phone, email, address, city) VALUES (?, ?, ?, ?, ?, ?, ?)';
        pool.query(insertQuery, [username, firstname, lastname, phone, email, address, city], (err, result) => {
            if (err) {
                console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ',err)
                 return res.status(500).send('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
            } else {
                console.log('บันทึกข้อมูลลง MySQL สำเร็จ:', result);
                res.send('บันทึกข้อมูลสำเร็จ');
            }
            });
    }else{
        res.send(`Username หรือ Email ไม่ถูกต้อง`);
    }

}

 });

}else{
    res.send(` ERROR ข้อมูลไม่ครบถ้วน `)
}
});

app.listen(port, ()=>{
    console.log(` Server is running at http://localhost:${port}`);
});