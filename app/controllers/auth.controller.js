const config = require("../config/auth.config");
const db = require("../models");
const nodemailer = require('nodemailer');
const User = db.user;
const Role = db.role;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { id } = require("translate-google/languages");

exports.activate = (req, res) => {
  let id = req.query.id

  User.find({ _id: id }, {} ,(err, result) => {
    if (err) throw err;
    delete result[0]['isActivated']
    result[0].isActivated = true
    User.findByIdAndUpdate(id,result[0],function(err,updatedResult){
      if(err){
        res.send({ message: "something went wrong, please try later!" , success : false});
      }else{
        res.send({ message: "Account activation successfull, please sign-in to your account!" , success : true});
    }
})
  });
}

exports.resetPassword = (req, res) => {
  let email = req.body.email

  let newPassword = bcrypt.hashSync(req.body.password, 8);
    User.findOneAndUpdate({ "email" : email },  { $set: { "password" : newPassword } },function(err,updatedResult){
      if(err){
        res.send({ message: "something went wrong, please try later!" , success : false});
      }else{
        res.send({ message: "Your password has been updated successfully!" , success : true});
    }
})

}
exports.forgotPassword = (req, res) => {
  let email = req.body.email
  User.find({ "email" : email }, {},function(err,result){
    let content = `Hello ${result[0].firstName} ${result[0].lastName}, <br>
    Please click the link to reset your account password <a href="https://pradshanthreddysunku1.github.io/translation-app/reset-password?email=${result[0].email}" target="_blank">Resetpassword</a>`
  sendMail(req.body.email, content, "Password reset link")
  res.send({ message: "We have sent a reset password link to you email, please check!",success : true });

})
}



exports.signup = (req, res) => {
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    password: bcrypt.hashSync(req.body.password, 8),
    isActivated: false
  });

  user.save((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (req.body.roles) {
      Role.find(
        {
          name: { $in: req.body.roles },
        },
        (err, roles) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          user.roles = roles.map((role) => role._id);
          
          user.save((err, result) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }
         
          let content = `Hello ${req.body.firstName} ${req.body.lastName}, <br>
          Please click the link to activate your account <a href="https://pradshanthreddysunku1.github.io/translation-app/account-activate?id=${result._id}" target="_blank">Activate</a>`
         sendMail(req.body.email, content, "Account activation")
            res.send({ message: "User was registered successfully!" });
          });
        }
      );
    } else {
      Role.findOne({ name: "user" }, (err, role) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        user.roles = [role._id];
        
        user.save((err,result) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          let content = `Hello ${req.body.firstName} ${req.body.lastName}, <br>
            Please click the link to activate your account <a href="https://pradshanthreddysunku1.github.io/translation-app/account-activate?id=${result._id}" target="_blank">Activate</a>`
          sendMail(req.body.email, content, "Account activation")
          res.send({ message: "User was registered successfully!" });
        });
      });
    }
  });
};

async function sendMail(emailDestination, content, subject) {
  
  return new Promise(async function (resolve, reject) {
    let transporter;
    
    
      transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: '465',
        secure: true,
       
        auth: {
          user: "teamsrh6@gmail.com", // replace with your Mailtrap credentials
          pass: "twzuiekfjzctdhmy"
        },
        debug: false, // show debug output
        logger: false // log information in console
  });

    const mailOptions = {
      from: `"TeamSRH" <no_reply@teamsrh.com>`,
      to: emailDestination,
      subject: subject,
      html: content
    };

    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.log(err)
      } else {
        console.log(info);
      }
    });

  })
};

// exports.mailTest = (req, res) => {
//   sendMail('teamsrh6@gmail.com', '');
// }

exports.signin = (req, res) => {
  User.findOne({
    username: req.body.username,
  })
    .populate("roles", "-__v")
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({ message: "Invalid Password!" });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400, // 24 hours
      });

      var authorities = [];

      for (let i = 0; i < user.roles.length; i++) {
        authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
      }

      req.session.token = token;

      res.status(200).send({
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName:user.lastName,
        email: user.email,
        roles: authorities,
        isActivated: user.isActivated
      });
    });
};

exports.signout = async (req, res) => {
  try {
    req.session = null;
    return res.status(200).send({ message: "You've been signed out!" });
  } catch (err) {
    this.next(err);
  }
};

