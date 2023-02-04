const express = require('express');
const router = express.Router();
const Comment = require('../models/comment');
const Post = require('../models/question');

// create
router.post('/', checkPostId, function(req, res){ 
  var post = res.locals.post; // 1
  
  req.body.post = post._id;       // 2

  Comment.create(req.body, function(err, comment){
    if(err){
      return console.error(err);  // req,body에 댓글의 내용이 들어있다.
    }
    return res.json({comment});
  });
});

module.exports = router;

// private functions
function checkPostId(req, res, next){ // 1
  Post.findOne({_id:req.query.postId},function(err, post){
  
    if(err) return res.json(err);

    res.locals.post = post; // 1
    next();
  });
}