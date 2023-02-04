const express = require('express');
const app = express();
const http = require('http');
const bodyParser = require('body-parser');
const dotenv = require("dotenv");

const cookieParser = require("cookie-parser");
app.use(cookieParser());

var { User } = require('./models/user'); 
const { auth } = require("./middleware/auth");

app.use(express.urlencoded({extended: true}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json())

dotenv.config();
const port = 5050;

// cors
const cors = require('cors');
app.use(cors());
app.use(
    cors({
      origin: true,
      credentials: true, //도메인이 다른경우 서로 쿠키등을 주고받을때 허용해준다고 한다
    })
  );

// DB연결 모듈
const connect = require('./models');
connect(); 


// 라우터 모듈
const indexRouter = require('./routes');
// const usersRouter = require('./routes/users');
// const commentsRouter = require('./routes/comments');

const qualRouter = require('./routes/quals');
const reviewRouter = require('./routes/reviews');
const questionRouter = require('./routes/questions');
const commentRouter = require('./routes/comments');

app.use('/quals', qualRouter);
app.use('/reviews', reviewRouter);
app.use('/questions', questionRouter);
app.use('/questions/comments', commentRouter);



////////////// api
app.post("/register", (req, res) => {
    var user = new User(req.body);
    try {
      const savedUser = user.save();
      console.log("hihi", savedUser);
      res.status(200).json({
        success: true
      });
    } catch (err) {
      res.status(500).json({ success: false, err });
    }
  });
  
app.get("/checkId", (req, res) => {
  var getId = req.body.id;
  try {
    if(User.findOne({id : getId})) {
      res.json({
        success: false
      });
    } else {
      res.json({
        success: true
      }); }
  } catch (err) {
    res.status(500).json(err);
  }
})

app.get("/checkUsername", (req, res) => {
  var getUsername = req.body.username;
  try {

    if(User.findOne({ name: getUsername})) {
      res.json({
        success: false
      });
    } else {
      res.json({
        success: true
      }); }
  } catch (err) {
    res.status(500).json(err);
  }
})
  
  // 3. login api
  
  app.post("/login", (req, res) => {
    //로그인을할때 아이디와 비밀번호를 받는다
    User.findOne({ id: req.body.id }, (err, user) => {
      if (err) {
        return res.json({
          loginSuccess: false,
          message: "존재하지 않는 아이디입니다.",
        });
      }
      user
        .comparePassword(req.body.password)
        .then((isMatch) => {
          if (!isMatch) {
            return res.json({
              loginSuccess: false,
              message: "비밀번호가 일치하지 않습니다",
            });
          }
          //비밀번호가 일치하면 토큰을 생성한다
          //해야될것: jwt 토큰 생성하는 메소드 작성
          user
            .generateToken()
            .then((user) => {
              res.cookie("x_auth", user.token, {
                maxAge: 1000 * 60 * 60 * 24 * 7, // 7일간 유지
                httpOnly: true,
              }).status(200).json({
                loginSuccess: true,
                userId: user._id,
                // path: 
              });
            }) 
            .catch((err) => {
              res.status(400).send(err);
              console.log("로그인에 실패하였습니다.");
            });
        })
        .catch((err) => res.json({ loginSuccess: false, err }));
    });
  });
  
  //auth 미들웨어를 가져온다
  //auth 미들웨어에서 필요한것 : Token을 찾아서 검증하기
  app.get("/auth", auth, (req, res) => {
    //auth 미들웨어를 통과한 상태 이므로
    //req.user에 user값을 넣어줬으므로
    res.status(200).json({
      _id: req._id,
      isAdmin: req.user.role === 09 ? false : true,
      isAuth: true,
      id: req.user.id,
      name: req.user.name,
      nickName: req.user.nickName,
      number: req.user.number,
  
  
    });
  });
  
  //user_id를 찾아서(auth를 통해 user의 정보에 들어있다) db에있는 토큰값을 비워준다
  app.get("/logout", auth, (req, res) => {
    User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
      if (err) return res.json({ success: false, err });
      res.clearCookie("x_auth");
      return res.status(200).send({
        success: true,
      });
    });
  });


// 서버 연결
app.listen(port, () => {
  console.log(port, '번 포트에서 대기 중');
});