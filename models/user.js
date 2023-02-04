const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
var { Schema } = require("mongoose");


var userSchema = new Schema({
    // 아이디
    userId: {
        type: String,
        trim: true,
        unique: 1
    },
    // 비밀번호
    password: {
        type: String,
        minlength: 4
    },
    // 닉네임
    name: {
      type: String,
      trim: true
    },
    // 학번
    classof: {
      type: String,
    },
    // 전공
    dept: {
      type: String,
      trim: true
    },
    token: { type: String,
 },
    tokenTime: {
  type: Number,
 },
})

userSchema.virtual('posts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'userId',
});
userSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'author',
});
userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });

//save 메소드가 실행되기전에 비밀번호를 암호화하는 로직을 짜야한다
userSchema.pre("save", function (next) {
  let user = this;

  //model 안의 paswsword가 변환될때만 암호화
  if (user.isModified("password")) {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);
      // hash - 암호화된 비밀번호
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;     
        next();
      });
    });
  } else {
    next();
  }
});

userSchema.pre('remove', async function (next) {
  const user = this;
  try {
    await Post.deleteMany({ userId: user._id });
    next();
  } catch (e) {
    next();
  }
});


userSchema.methods.comparePassword = function (plainPassword) {
  //plainPassword를 암호화해서 현재 비밀번호화 비교
  return bcrypt
    .compare(plainPassword, this.password)
    .then((isMatch) => isMatch)
    .catch((err) => err);
};

// user.js 에 토큰생성
userSchema.methods.generateToken = function () {
  const token = jwt.sign(this._id.toHexString(), "secretToken");
  this.token = token;
  return this.save()
    .then((user) => user)
    .catch((err) => err);
};

userSchema.statics.findByToken = function (token) {
  let user = this;
  //secretToken을 통해 user의 id값을 받아오고 해당 아이디를 통해
  //Db에 접근해서 유저의 정보를 가져온다
  return jwt.verify(token, "secretToken", function (err, decoded) {
    return user
      .findOne({ _id: decoded, token: token })
      .then((user) => user)
      .catch((err) => err);
  });
};


var User = mongoose.model("User", userSchema);

module.exports = { User };