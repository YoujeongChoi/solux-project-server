const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { Schema } = require("mongoose");
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose.connection);
var Comment = require('./comment'); 

const questionSchema = new Schema({
    // 글 제목
    title : {
        type : String,
        required : true
    },

    // 글 본문
    content : {
        type : String,
        required : true
    },

    // 글 최초 생성일자
    createdAt: {
        type : Date,
        default : Date.now,
    },

    // 글 수정일자
    updatedAt : {
        type : Date,
        // default : Date.now,
    },

    // 삭제될경우 true
    isDeleted : {
        type : Boolean,
        default : false
    },
    
    // 글 작성자 이름
    username : {
        type : String,
        // required : true,
        ref : 'User'
    },

    // 주전공
    mainDept: {
        type: String,
    },

    // 부전공
    subDept: {
        type: String
    }

}, {collection : '', versionKey : false});

questionSchema.plugin(autoIncrement.plugin, {
    model: 'question',
    field: 'num',
    startAt: 1,     // 시작
    increment: 1    // 증가
});
questionSchema.set('toObject', { virtuals: true });
questionSchema.set('toJSON', { virtuals: true });

questionSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'post',
  });

questionSchema.methods.createPost = function (text) {
    const post = new this({
      text: text,
    });
    return post.save();
  };

questionSchema.pre('remove', async function (next) {
    const post = this;
    try {
      await Comment.deleteMany({ post: post._id });
      next();
    } catch (e) {
      next();
    }
  });

module.exports = mongoose.model('Question', questionSchema);