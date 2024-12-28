var express = require('express');
var router = express.Router();
const { exec } = require("child_process");
const fs = require("fs");


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'hello' });
});

router.post("/compile-cpp", (req, res) => {
    const { code, input } = req.body;
  
    // Sử dụng thư mục tạm thời của hệ thống (cần thiết cho Vercel)
    const tempFilePath = "/tmp/Main.cpp"; // File tạm cho mã C++
    const compiledFilePath = "/tmp/Main.out"; // File biên dịch đầu ra
  
    try {
      // Lưu mã C++ vào file tạm
      fs.writeFileSync(tempFilePath, code, { encoding: "utf8", flag: "w" });
  
      // Biên dịch mã C++ (tạo file thực thi)
      exec(`g++ -o ${compiledFilePath} ${tempFilePath}`, (compileErr, compileStdout, compileStderr) => {
        if (compileErr) {
          res.status(400).json({ error: `Compile Error: ${compileStderr}` });
          return;
        }
  
        // Chạy chương trình C++ đã biên dịch với input
        const command = input
          ? `echo "${input}" | ${compiledFilePath}`
          : `${compiledFilePath}`;
  
        exec(command, (runErr, runStdout, runStderr) => {
          if (runErr) {
            res.status(400).json({ error: `Runtime Error: ${runStderr}` });
            return;
          }
  
          const outputLines = runStdout.trim();
          // const finalOutput = outputLines[outputLines.length - 1];
          res.json({ output: outputLines });
        });
      });
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  

router.post("/compile-java", (req, res) => {
  const { code, input } = req.body;

  // Lưu mã Java vào file
  fs.writeFileSync("Main.java", code);

  // Biên dịch mã Java
  exec("javac Main.java", (compileErr, compileStdout, compileStderr) => {
      if (compileErr) {
          res.status(400).json({ error: `Compile Error: ${compileStderr}` });
          return;
      }

      // Chạy mã Java với input (nếu có)
      const command = input
          ? `echo "${input}" | java Main`
          : "java Main";

      exec(command, (runErr, runStdout, runStderr) => {
            if (runErr) {
                res.status(400).json({ error: `Runtime Error: ${runStderr}` });
                return;
            }

            const outputLines = runStdout.trim();
            // const finalOutput = outputLines[outputLines.length - 1];
            res.json({ output: outputLines });
      });
  });
});

const retryExec = (command, retries, delay) =>
    new Promise((resolve, reject) => {
        const attempt = (remainingRetries) => {
            exec(command, (err, stdout, stderr) => {
                if (!err) {
                    resolve({ stdout, stderr }); // Thành công
                } else if (remainingRetries > 0) {
                    console.log(`Retrying in ${delay}ms...`);
                    setTimeout(() => attempt(remainingRetries - 1), delay); // Chờ trước khi thử lại
                } else {
                    reject({ error: err, stderr }); // Hết lần retry
                }
            });
        };
        attempt(retries); // Bắt đầu thử
    });


// router.post("/test", (req, res) => {
//   const { code, input } = req.body;

//   // Sử dụng thư mục tạm thời của Vercel (/tmp)
//   const tempFilePath = "/tmp/Main.java"; // Đường dẫn file tạm thời
//   const compiledFilePath = "/tmp"; // Nơi chứa file biên dịch

//   try {
//       fs.writeFileSync(tempFilePath, code, { encoding: "utf8", flag: "w" });

//         exec(`javac -d ${compiledFilePath} ${tempFilePath}`, async (compileErr, compileStdout, compileStderr) => {
//             if (compileErr) {
//                 res.status(400).json({ error: `Compile Error: ${compileStderr}` });
//                 return;
//             }

//             // Chạy mã Java với input
//             const command = `echo "${input}" | java -cp ${compiledFilePath} Main`;
//             try {
//                 const { stdout } = await retryExec(command, 1, 2000);

//                 // Xử lý kết quả đầu ra
//                 const outputLines = stdout.trim().split("\n");
//                 const finalOutput = outputLines[outputLines.length - 1];

//                 res.json({ output: finalOutput });
//             } catch ({ error, stderr }) {
//                 res.status(400).json({ error: `Runtime Error: ${stderr}` }); // Lỗi sau khi retry
//             }
//         });
//   } catch (err) {
//       res.status(500).json({ error: "Internal Server Error" });
//   }
// });

router.post("/test", (req, res) => {
    const { code, input, language } = req.body;
  
    // Kiểm tra ngôn ngữ lập trình (java hoặc cpp)
    if (!["java", "cpp"].includes(language)) {
      res.status(400).json({ error: "Unsupported language. Use 'java' or 'cpp'." });
      return;
    }
  
    // Thư mục tạm cho file mã nguồn
    const tempFilePath = language === "java" ? "/tmp/Main.java" : "/tmp/main.cpp";
    const compiledFilePath = "/tmp"; // Thư mục chứa file biên dịch
  
    try {
      // Lưu mã nguồn vào file tạm
      fs.writeFileSync(tempFilePath, code, { encoding: "utf8", flag: "w" });
  
      if (language === "java") {
        // Biên dịch mã Java
        exec(`javac -d ${compiledFilePath} ${tempFilePath}`, async (compileErr, compileStdout, compileStderr) => {
          if (compileErr) {
            res.status(400).json({ error: `Compile Error: ${compileStderr}` });
            return;
          }
  
          // Chạy mã Java với input
          const command = `echo "${input}" | java -cp ${compiledFilePath} Main`;
          try {
            const { stdout } = await retryExec(command, 1, 2000);
  
            // Xử lý kết quả đầu ra
            const outputLines = stdout.trim();
            // const finalOutput = outputLines[outputLines.length - 1];
  
            res.json({ output: outputLines });
          } catch ({ error, stderr }) {
            res.status(400).json({ error: `Runtime Error: ${stderr}` });
          }
        });
      } else if (language === "cpp") {
        // Biên dịch mã C++
        const compiledCppPath = "/tmp/main.out"; // File thực thi cho C++
        exec(`g++ -o ${compiledCppPath} ${tempFilePath}`, async (compileErr, compileStdout, compileStderr) => {
          if (compileErr) {
            res.status(400).json({ error: `Compile Error: ${compileStderr}` });
            return;
          }
  
          // Chạy mã C++ với input
          const command = input
            ? `echo "${input}" | ${compiledCppPath}`
            : `${compiledCppPath}`;
          try {
            const { stdout } = await retryExec(command, 1, 2000);
  
            // Xử lý kết quả đầu ra
            const outputLines = stdout.trim();
            // const finalOutput = outputLines[outputLines.length - 1];
  
            res.json({ output: outputLines });
          } catch ({ error, stderr }) {
            res.status(400).json({ error: `Runtime Error: ${stderr}` });
          }
        });
      }
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  

router.get("/check-java", (req, res) => {
    exec("java -version", (err, stdout, stderr) => {
        if (err) {
            res.status(500).json({ error: "Java is not installed or not working..." });
        } else {
            res.json({ version: stderr || stdout });
        }
    });
});

router.get("/check-cpp", (req, res) => {
    exec("g++ --version", (err, stdout, stderr) => {
      if (err) {
        res.status(500).json({ error: "g++ is not installed or not working..." });
      } else {
        res.json({ version: stdout || stderr });
      }
    });
  });

module.exports = router;
