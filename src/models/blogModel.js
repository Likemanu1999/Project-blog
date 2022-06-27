const mongoose = require('mongoose')
const objectId = mongoose.Schema.Types.ObjectId

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    authorId: {
        type: objectId,
        ref: 'Author',
        required: true
    },
    tags: [String],
    category: {
        type: String,
        required: true
    },
    subcategory: [String],
    deletedAt:{
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    publishedAt: {
        type: String
    },
    isPublished: {
        type: Boolean,
        default: false
    }


}, { timestamps: true })

module.exports = mongoose.model('Blog', blogSchema)