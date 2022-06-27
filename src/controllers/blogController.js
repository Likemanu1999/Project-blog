const { request } = require("express")
const authorModel = require("../models/authorModel")
const blogModel = require("../models/blogModel")


// validation function 
const isValid = function(value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidRequestBody = function(requestBody) {
    return Object.keys(requestBody).length > 0
        //will return an array of all keys. so, we can simply get the length of an array with .length
}

const createBlog = async function (req, res) {
    try {
        let blogData = req.body
        if (Object.keys(blogData).length === 0) {
            return res.status(400).send({ msg: "BAD REQUEST (No data provided in the body)" })
        }

        let authorId = blogData.authorId
        let authorFound = await authorModel.findById({ _id: authorId })

        if ( !authorFound ) {
            return res.status(400).send({ status: false, msg: "Author is not present." })
        }

        if (!blogData.isPublished || blogData.isPublished == false) {
            blogData.publishedAt = null
            let blogCreated = await blogModel.create(blogData)
            res.status(201).send({ status: true, data: blogCreated })
        } else {
            blogData.publishedAt = new Date()
            let blogCreated = await blogModel.create(blogData)
            res.status(201).send({ status: true, data: blogCreated })
        }
    } catch (err) {
        res.status(500).send({ msg: err.message })
    }
}


const updateBlog = async function (req, res) {
    let blogId = req.params.blogId;
    let blog = await blogModel.findById(blogId);

    if (!blog) {
        return res.status(404).send("No such blog exists");
    } else {
        let title = req.body.title;
        let body = req.body.body;
        let tag = req.body.tag
        let subcategory = req.body.subcategory
        let updatedBlog = await blogModel.updateOne(
            { _id: blogId },
            { $set: { title: title, body: body, isPublished: true, publishedAt: new Date() }, $push: { tags: tag, subcategory: subcategory } },
            { new: true });
        return res.status(201).send({ status: updatedBlog, data: updatedBlog });
    }
};

const deleteBlogById = async function (req, res) {
    try {
        let blogid = req.params.blogId;

        let blogIdPresent = await blogModel.findById({ _id: blogid })
        if (!blogIdPresent) {
            res.status(404).send({ status: false, msg: "This blog doesn't exist." })
        } else {
            if (blogIdPresent.isDeleted == true) {
                return res.status(400).send({ status: false, msg: "The blog is already deleted." })
            } else {
                let blogDeleted = await blogModel.findOneAndUpdate(
                    { _id: blogid, isDeleted: false },
                    { $set: { isDeleted: true, deletedAt: new Date() } },
                    { new: true }
                );
                return res.status(200).send({ status: true, blogDeleted: blogDeleted })
            }
        }

    } catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
};





const deleteByQuery = async function (req, res) {
    try {
        let data = req.query
        let category = data.category
        let authorId = data.authorId
        let tags = data.tags
        let subcategory = data.subcategory

        if (category) {
            let findCategory = await blogModel.find({ category: category })
            if ( findCategory.length == 0 ) return res.status(404).send({ status: false, msg: "No blog found with this category." })
        }
        if (authorId) {
            let findAuthorId = await blogModel.find({ authorId: authorId })
            if ( findAuthorId.length == 0 ) return res.status(404).send({ status: false, msg: "No blog found with this authorId." })
        }
        if (tags) {
            let findTag = await blogModel.find({ tags: tags })
            if ( findTag.length == 0 ) return res.status(404).send({ status: false, msg: "No blog found with this tag." })
        }
        if (subcategory) {
            let findSubcategory = await blogModel.find({ subcategory: subcategory })
            if ( findSubcategory.length == 0 ) return res.status(404).send({ status: false, msg: "No blog found with this subcategory." })
        }

        data.isPublished = false
        let findblogs = await blogModel.find( data )
        if ( findblogs.length == 0 ) return res.status(400).send({status: false, msg: "No unpublished blog found as per the data provided."})
        let deleted = await blogModel.updateMany( data, { isDeleted: true, deletedAt: new Date() }, { new: true } )
        return res.status(200).send({ status: true, data: deleted } )
    } catch (err) {
        return res.status(500).send( { status: false, error: err.message })
    }
}


const getblogs3 = async function (req, res) {
    try {
        let filters = req.query

        let category = filters.category
        let authorId = filters.authorId
        let tags = filters.tags
        let subcategory = filters.subcategory

        if (category) {
            let findCategory = await blogModel.find({ category: category })
            if ( findCategory.length == 0 ) return res.status(404).send({ status: false, msg: "No blog found with this category."})
        }
        if (authorId) {
            let findAuthorId = await blogModel.find({ authorId: authorId })
            if ( findAuthorId.length == 0 ) return res.status(404).send({ status: false, msg: "No blog found with this authorId."})
        }
        if (tags) {
            let findTag = await blogModel.find({ tags: tags })
            if ( findTag.length == 0 ) return res.status(404).send({ status: false, msg: "No blog found with this tag."})
        }
        if (subcategory) {
            let findSubcategory = await blogModel.find({ subcategory: subcategory })
            if ( findSubcategory.length == 0 ) return res.status(404).send({ status: false, msg: "No blog found with this subcategory."})
        }

        let mandatory = { isDeleted: false, isPublished: true, ...filters }
        let getBlogs = await blogModel.find( mandatory )
        if ( getBlogs.length === 0 ) return res.status(404).send({ status: false, msg: `No such blog exists.` })
        return res.status(201).send({ status: true, data: getBlogs })
    } catch (err) {
        // console.log(err);
        return res.status(500).send({ status: false, error: err.message })
    }
}



module.exports.createBlog = createBlog
module.exports.deleteBlogById = deleteBlogById
module.exports.updateBlog = updateBlog
module.exports.deleteByQuery = deleteByQuery
module.exports.getblogs3 = getblogs3
