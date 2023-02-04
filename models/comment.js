const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { Schema } = require("mongoose");
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose.connection);

const commentSchema = new Schema({
    post : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Question',
        // require : true
    },
    
    // // 댓글 작성자
    // author : {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User',
    //     // required: true,
    // },

    // 댓글작성자
    author : {
        type :String
    },

    parentComment: { // 1
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
    },

    depth: {
        type: Number,
        default: 1,
    },
    
    // 글 본문
    comment : {
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

    // true : 삭제됨
    isDeleted : {
        type : Boolean,
        default : false
    },

    // // 글 작성자 이름
    username : {
        type : String,
        // required : true,
        ref : 'User'
    }

}, {collection : '', versionKey : false},  { toObject: { virtuals: true }, toJSON: { virtuals: true } },);

commentSchema.plugin(autoIncrement.plugin, {
    model: 'commentSchema',
    field: 'num',
    startAt: 1,     // 시작
    increment: 1    // 증가
});

commentSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'parentComment',
  });
  
  commentSchema
    .virtual('childComments')
    .get(function () {
      return this._childComments;
    })
    .set(function (v) {
      this._childComments = v;
    });

module.exports = mongoose.model('Comment', commentSchema);