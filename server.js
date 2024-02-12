const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const mysql = require("mysql");
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "carmodels",
  waiForconnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to Mysql", err);
  } else {
    console.log("Connected to Mysql");
  }
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.get("/information", (req, res) => {
  res.sendFile(path.join(__dirname, "information.html"));
});

app.get('/login',(req, res)=> {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/sigup',(req, res)=> {
    res.sendFile(path.join(__dirname, 'sigup.html'));
});

app.post("/submit", (req, res) => {
  const { username, firstname, lastname, phone, email, address, city } =
    req.body;

  // response.send(request.body);
  console.log(`Received data: ${JSON.stringify(req.body)}`);

  if (username && email) {
    const selectQuery = "SELECT * FROM signup WHERE username = ? AND email = ?";
    pool.query(selectQuery, [username, email], (err, result) => {
      if (err) {
        console.error("ข้อมูลไม่ถูกต้อง", err);
        return res.status(500).send("ข้อมูลไม่ถูกต้อง");
      } else {
        if (result.length > 0) {
          console.log("บันทึกข้อมูลสำเร็จ:", result);

          // สร้างคำสั่ง SQL INSERT
          const insertQuery =
            "INSERT INTO customer (username,firstname, lastname, phone, email, address, city) VALUES (?, ?, ?, ?, ?, ?, ?)";
          pool.query(
            insertQuery,
            [username, firstname, lastname, phone, email, address, city],
            (err, result) => {
              if (err) {
                console.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล: ", err);
                return res.status(500).send("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
              } else {
                console.log("บันทึกข้อมูลลง MySQL สำเร็จ:", result);
                res.send("บันทึกข้อมูลสำเร็จ");
              }
            }
          );
        } else {
          res.send(`Username หรือ Email ไม่ถูกต้อง`);
        }
      }
    });
  } else {
    res.send(` ERROR ข้อมูลไม่ครบถ้วน `);
  }
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  console.log(`Received data: ${JSON.stringify(username)}`);

  if (username && password) {
    const selectQuery = "SELECT * FROM signup WHERE username = ?";
    pool.query(selectQuery, [username], (err, result) => {
      if (err) {
        console.error("ไม่สามารถเชื่อมต่อกับฐานข้อมูลได้", err);
        return res.status(500).send("ไม่สามารถเชื่อมต่อกับฐานข้อมูลได้");
      }

      if (result.length > 0) {
        const hashedPasswordInDB = result[0].password;
        bcrypt.compare(password, hashedPasswordInDB, (err, bcryptResult) => {
          if (err) {
            console.error("เกิดข้อผิดพลาดในการเปรียบเทียบรหัสผ่าน", err);
            return res
              .status(500)
              .send("เกิดข้อผิดพลาดในการเปรียบเทียบรหัสผ่าน");
          }

          // บันทึกการเข้าสู่ระบบลงในฐานข้อมูล
          const insertLoginQuery =
            "INSERT INTO login (username, password) VALUES (?,?)";
          pool.query(
            insertLoginQuery,
            [username, hashedPasswordInDB],
            (err, loginResult) => {
              if (err) {
                console.error("เกิดข้อผิดพลาดในการบันทึกการเข้าสู่ระบบ: ", err);
                return res
                  .status(500)
                  .send("เกิดข้อผิดพลาดในการบันทึกการเข้าสู่ระบบ");
              }

              console.log(
                "บันทึกการเข้าสู่ระบบลงในฐานข้อมูลสำเร็จ:",
                loginResult
              );
              res.send("เข้าสู่ระบบสำเร็จ");
            }
          );
        });
      } else {
        res.send("ไม่พบชื่อผู้ใช้ในฐานข้อมูล");
      }
    });
  } else {
    res.send("ERROR ข้อมูลไม่ครบถ้วน");
  }
});

app.post("/register", (req, res) => {
  const { username, email, password_1, password_2 } = req.body;

  console.log(`Received data: ${JSON.stringify(username)}`);

  if (
    username &&
    email &&
    password_1 &&
    password_2 &&
    password_1 === password_2
  ) {
    bcrypt.hash(password_1, 10, (err, hashedPassword) => {
      if (err) {
        console.error("เกิดข้อผิดพลาดในการแปลงรหัสผ่าน: ", err);
        return res.status(500).send("เกิดข้อผิดพลาดในการสร้างบัญชี");
      }

      // สร้างคำสั่ง SQL INSERT
      const insertQuery =
        "INSERT INTO signup (username, email, password) VALUES (?, ?, ?)";
      pool.query(
        insertQuery,
        [username, email, hashedPassword],
        (err, result) => {
          if (err) {
            console.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล: ", err);
            return res.status(500).send("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
          } else {
            console.log("บันทึกข้อมูลลงในตาราง mysql สำเร็จ:", result);
            res.send("สมัคสมาชิกสำเร็จ");
          }
        }
      );
    });
  } else if (password_1 !== password_2) {
    res.send("ERROR รหัสผ่านไม่ตรงกัน ");
  } else {
    res.send("ERROR ข้อมูลไม่ครบถ้วน ");
  }
});

app.listen(port, () => {
  console.log(` Server is running at http://localhost:${port}`);
});
