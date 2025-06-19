"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import api from "../services/api"

const Forum = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const [posts, setPosts] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "tips",
    tags: "",
  })

  const categories = [
    { value: "all", label: "All Posts", icon: "📋" },
    { value: "tips", label: "Tips & Tricks", icon: "💡" },
    { value: "challenges", label: "Challenge Updates", icon: "🏆" },
    { value: "questions", label: "Questions", icon: "❓" },
    { value: "success", label: "Success Stories", icon: "🎉" },
    { value: "general", label: "General Discussion", icon: "💬" },
  ]

  useEffect(() => {
    fetchPosts()
  }, [selectedCategory, searchTerm])

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== "all") {
        params.append("category", selectedCategory)
      }
      if (searchTerm) {
        params.append("search", searchTerm)
      }

      const response = await api.get(`/forum?${params.toString()}`)
      setPosts(response.data)
    } catch (error) {
      console.error("Error fetching posts:", error)
    }
  }

  const handleCreatePost = async (e) => {
    e.preventDefault()
    try {
      const postData = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
      }
      await api.post("/forum", postData)
      setFormData({
        title: "",
        content: "",
        category: "tips",
        tags: "",
      })
      setShowCreateForm(false)
      fetchPosts()
    } catch (error) {
      console.error("Error creating post:", error)
    }
  }

  const handleLikePost = async (postId) => {
    try {
      await api.post(`/forum/${postId}/like`)
      fetchPosts()
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  const handleAddComment = async (postId, content) => {
    try {
      await api.post(`/forum/${postId}/comment`, { content })
      fetchPosts()
    } catch (error) {
      console.error("Error adding comment:", error)
    }
  }

  const getCategoryIcon = (category) => {
    const cat = categories.find((c) => c.value === category)
    return cat ? cat.icon : "💬"
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Today"
    if (diffDays === 2) return "Yesterday"
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    return date.toLocaleDateString()
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Please log in to access the community forum</h2>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Community Forum</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          {showCreateForm ? "Cancel" : "Create Post"}
        </button>
      </div>

      {/* Create Post Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Create New Post</h2>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="What's your post about?"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {categories.slice(1).map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="recycling, tips, beginner"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="6"
                placeholder="Share your thoughts, tips, or questions..."
                required
              />
            </div>
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Create Post
            </button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Search posts..."
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.value
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category.icon} {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            onLike={handleLikePost}
            onComment={handleAddComment}
            currentUser={user}
            getCategoryIcon={getCategoryIcon}
            formatDate={formatDate}
          />
        ))}

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No posts found. Be the first to start a discussion!</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Post Card Component
const PostCard = ({ post, onLike, onComment, currentUser, getCategoryIcon, formatDate }) => {
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [isLiked, setIsLiked] = useState(post.likes.includes(currentUser?.id))

  const handleLike = () => {
    onLike(post._id)
    setIsLiked(!isLiked)
  }

  const handleComment = (e) => {
    e.preventDefault()
    if (commentText.trim()) {
      onComment(post._id, commentText)
      setCommentText("")
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600 font-bold">{post.userId.name.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h3 className="font-bold">{post.userId.name}</h3>
            <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">{getCategoryIcon(post.category)}</span>
          <span className="text-sm text-gray-500 capitalize">{post.category}</span>
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">{post.title}</h2>
        <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${
            isLiked ? "text-red-600 bg-red-50" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <span>{isLiked ? "❤️" : "🤍"}</span>
          <span className="text-sm">{post.likes.length}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 px-3 py-1 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <span>💬</span>
          <span className="text-sm">{post.comments.length}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {/* Add Comment Form */}
          <form onSubmit={handleComment} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Add a comment..."
              />
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Post
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-3">
            {post.comments.map((comment, index) => (
              <div key={index} className="flex gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-sm font-bold">{comment.userId.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{comment.userId.name}</span>
                      <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Forum
