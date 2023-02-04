const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { Schema } = require("mongoose");
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose.connection);

const qualSchema = new Schema({
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
        default : Date.now,
    },

    // 삭제됐을경우 - true
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

qualSchema.plugin(autoIncrement.plugin, {
    model: 'qual',
    field: 'num',
    startAt: 1,     // 시작
    increment: 1    // 증가
});

module.exports = mongoose.model('Qual', qualSchema);