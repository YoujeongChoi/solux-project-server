const express = require('express');
const router = express.Router();
var Question = require('../models/question');
var Comment = require('../models/comment');
const {auth} = require('../middleware/auth');
// var User = require('../models/user');

// 게시글 작성 - 권한필요
router.post("/", auth, async (req, res) => {
    const newPost = new Question(req.body);
    console.log(req.body);
    try {
        const savedPost = await newPost.save();
      res.status(200).json(savedPost);
    } catch(err) {
        res.status(500).json(err);
    }
     
});

// 게시글 수정
router.put('/:id', auth, async (req, res) => {
    const post = await Question.findById((req.params.id)); 

    if (post.username === req.user.name) {
        try {
            var date = new Date();
            post.title = req.body.title;
            console.log("title", req.body.title);
            post.content = req.body.content;
            console.log("content", req.body.content);
            post.updatedAt = date;
            console.log("date", date);

            console.log("post", post);
            await post.save();
            res.json(post);
        } catch(err) {
            res.status(500).json(err);
        }    
    } else {
        res.status(401).json("글 작성자만 수정 가능합니다.")
    }
})


// 게시물 삭제 - 권한필요
router.delete("/:id", auth, async (req, res) => {
    try {
        const post = await Question.findById(req.params.id);
        if(post.username === req.body.username) {
            try {
                // await Post.findByIdAndDelete(req.params.id);
                await post.delete();
                res.status(200).json("게시물이 정상적으로 삭제되었습니다.");
            } catch (err) {
                res.status(500).json(err);
            }
        } else {
            res.status(401).json("글 작성자만 삭제 가능합니다.");
        }
    } catch (err) {
        res.status(500).json(err);
    }
})


// 특정 게시물 조회
router.get("/:id", async (req, res) => {
        Promise.all([
            Question.findOne({_id : req.params.id}).populate({path : 'username', populate : {path : "name"}}),
            Comment.find({_id : req.params.id}).sort('createdAt').populate({path : 'author', populate : {path : "name"}}),

        ])
        .then (([post, comments]) => {

            return res.status(200).json({post, comments});
            
        })
        .catch((err) => {
            console.log('err: ', err);
            return res.status(500).json(err);
        });
 });
       


// 모든 글 조회 - 필터링 (유저이름)
router.get("/", async (req, res) => {
    const username = req.query.user;
    const catName = req.query.cat;
    try {
        let posts;
        if(username) {
            posts = await Question.find({username:username})
        // } else if(catName) {
        //     posts = await Qual.find({categories: {
        //         $in:[catName]
        //     }})
        } else {
            posts = await Question.find();
        }
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json(err);
    }
})



module.exports = router;