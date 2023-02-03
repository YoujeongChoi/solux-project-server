const express = require('express');
const router = express.Router();
const Qual = require('../models/qual');


// 게시글 작성 - 권한필요
router.post("/", async (req, res) => {
    const newPost = new Qual(req.body);
    console.log(req.body);
    try {
        const savedPost = await newPost.save();
      res.status(200).json(savedPost);
    } catch(err) {
        res.status(500).json(err);
    }
     
});

// 게시글 수정
router.put('/:id', async (req, res) => {
    try {
    // 게시물 작성자 판단
    const post = await Qual.findById(req.params.id);  
        // db에서 게시물 검색      
        if(post.username === req.body.username) {
          try { 
              // 작성자 일치 확인
              const updatedPost = Qual.findByIdAndUpdate(req.params.id, {       
                $set: req.body 
              }, { new: true });
                res.status(200).json(updatedPost);
          } catch(err) {
              res.status(500).json(err);
          }
      } else {
          res.status(401).json("글 작성자만 수정 가능합니다.")
      }
    
    } catch(err) {
        res.status(500).json(err);
    }
  });


// 게시물 삭제 - 권한필요
router.delete("/:id", async (req, res) => {
    try {
        const post = await Qual.findById(req.params.id);
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
    try {
        const post = await Qual.findById(req.params.id);
        res.status(200).json(post);
    } catch(err) {
        res.status(500).json(err);   
    }
})


// 모든 글 조회 - 필터링 (유저이름)
router.get("/", async (req, res) => {
    const username = req.query.user;
    const catName = req.query.cat;
    try {
        let posts;
        if(username) {
            posts = await Qual.find({username:username})
        // } else if(catName) {
        //     posts = await Qual.find({categories: {
        //         $in:[catName]
        //     }})
        } else {
            posts = await Qual.find();
        }
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json(err);
    }
})



module.exports = router;