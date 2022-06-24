const express = require('express')
const router = express.Router()
const authorController = require("../controllers/authorController")
const blogController = require("../controllers/blogController")
const middleware = require("../middlewares/middleware")

router.post('/authors', authorController.createAuthor)

router.post('/login', authorController.loginAuthor)

// router.post('/blogs', blogController.createBlog)
router.post('/blogs', middleware.authenticate, middleware.authorize, blogController.createBlog)

router.get('/blogs', blogController.getBlogs2)

router.put('/blogs/:blogId', middleware.authenticate, middleware.authorize, blogController.updateBlog)

router.delete('/blogs/:blogId', middleware.authenticate, middleware.authorize, blogController.deleteBlogById)

router.delete('/blogs', middleware.authenticate, middleware.authorize, blogController.deleteBlogByQuery)


module.exports = router;