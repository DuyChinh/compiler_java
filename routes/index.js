var express = require('express');
var router = express.Router();
const { exec } = require("child_process");
const fs = require("fs");


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'hello' });
});

router.post("/compile", (req, res) => {
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

          res.json({ output: runStdout });
      });
  });
});


router.post("/test", (req, res) => {
  const { code, input } = req.body;

  // Lưu mã Java vào file
  fs.writeFileSync("Main.java", code);

  // Biên dịch mã Java
  exec("javac Main.java", (compileErr, compileStdout, compileStderr) => {
      if (compileErr) {
          res.status(400).json({ error: `Compile Error: ${compileStderr}` });
          return;
      }

      // Chạy mã Java với input
      const command = `echo "${input}" | java Main`;
      exec(command, (runErr, runStdout, runStderr) => {
          if (runErr) {
              res.status(400).json({ error: `Runtime Error: ${runStderr}` });
              return;
          }

          res.json({ output: runStdout });
      });
  });
});


module.exports = router;
