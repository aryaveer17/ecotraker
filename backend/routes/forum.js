const express = require("express")
const Post = require("../models/Post")
const auth = require("../middleware/auth")

const router = express.Router()

// Get all posts
router.get("/", async (req, res) => {
  try {
    const { category, search } = req.query
    const query = {}

    if (category && category !== "all") {
      query.category = category
    }

    if (search) {
      query.$or = [{ title: { $regex: search, $options: "i" } }, { content: { $regex: search, $options: "i" } }]
    }

    const posts = await Post.find(query)
      .populate("userId", "name avatar")
      .populate("comments.userId", "name avatar")
      .sort({ isPinned: -1, createdAt: -1 })

    res.json(posts)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Create a new post
router.post("/", auth, async (req, res) => {
  try {
    const { title, content, category, tags } = req.body

    const post = new Post({
      userId: req.userId,
      title,
      content,
      category,
      tags: tags || [],
    })

    await post.save()
    await post.populate("userId", "name avatar")

    res.status(201).json(post)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Like/unlike a post
router.post("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    const likeIndex = post.likes.indexOf(req.userId)

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1)
    } else {
      // Like
      post.likes.push(req.userId)
    }

    await post.save()
    res.json({ likes: post.likes.length, liked: likeIndex === -1 })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Add a comment
router.post("/:id/comment", auth, async (req, res) => {
  try {
    const { content } = req.body
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    post.comments.push({
      userId: req.userId,
      content,
      createdAt: new Date(),
    })

    await post.save()
    await post.populate("comments.userId", "name avatar")

    res.json(post)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
