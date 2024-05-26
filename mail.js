require("dotenv").config();
var nodemailer = require("nodemailer");
var jade = require("jade");
var fs = require("fs");

var sendMail = ({ to, subject, html }) => {
  try {
    var template = process.cwd() + "/views/" + html;
    var transporter = nodemailer.createTransport({
      service: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });
    fs.readFile(template, "utf8", function (err, file) {
      if (err) {
        return res.send("ERROR!");
      } else {
        var mailOptions = {
          from: process.env.MAIL_FROM_ADDRESS,
          to: to,
          subject: subject,
          html: file,
        };
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
      }
    });
  } catch (Error) {
    throw Error;
  }
};

module.exports = sendMail;
