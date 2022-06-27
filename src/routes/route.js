const express = require('express')
const router = express.Router()
const authorController = require("../controllers/authorController")
const blogController = require("../controllers/blogController")
const middleware = require("../middlewares/middleware")

router.post('/authors', authorController.createAuthor)

router.post('/login', authorController.loginAuthor)

// router.post('/blogs', blogController.createBlog)
router.post('/blogs', middleware.authenticate, blogController.createBlog)

router.get('/blogs', middleware.authenticate, blogController.getblogs3)
// router.get('/blogs', middleware.authenticate, middleware.authorize, blogController.getBlogs2)

router.put('/blogs/:blogId', middleware.authenticate, middleware.authorize, blogController.updateBlog)

router.delete('/blogs/:blogId', middleware.authenticate, middleware.authorize, blogController.deleteBlogById)

// router.delete('/blogs', blogController.deleteByQuery)
router.delete('/blogs', middleware.authenticate, middleware.authorize, blogController.deleteByQuery)


module.exports = router;