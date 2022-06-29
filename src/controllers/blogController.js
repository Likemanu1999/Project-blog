const authorModel = require("../models/authorModel")  // importing the module that contains the author schema
const blogModel = require("../models/blogModel")  // importing the module that contains the blog schema


// validation function 
const isValid = function(value) {
    if ( typeof value === 'undefined' || value === null ) return false
    if ( typeof value === 'string' && value.trim().length === 0 ) return false
    if ( typeof value == 'string' && value.length === 0 ) return false
    if ( typeof value == 'string' && value.length !== value.trim().length ) return false
    if ( typeof value == 'number' ) return false
    return true;
}


/*

const isValidRequestBody = function(requestBody) {
    return Object.keys(requestBody).length > 0
        //will return an array of all keys. so, we can simply get the length of an array with .length
}

*/



// ==> POST api: Create a blog

const createBlog = async function (req, res) {
    try {
        let blogData = req.body
        if (Object.keys(blogData).length === 0) {  // if there is no data provided in the request body
            return res.status(400).send({ status: false, msg: "BAD REQUEST (No data provided in the body)" })
        }

        // extracting the data provided in the request body
        let authorId = blogData.authorId
        let title = blogData.title
        let body = blogData.body
        let category = blogData.category
        if ( !title || !body || !authorId || !category ) {  // if any of the required fields is not provided.
            return res.status(400).send({ status: false, msg: "Provide the mandatory fields: title, body, authorId and category." })
        }

        // validations for mandatory fields.
        let inValid = ' '
        if ( !isValid ( authorId ) ) inValid = inValid + 'authorId '
        if ( !isValid ( body ) ) inValid = inValid + "body "
        if ( !isValid ( title ) ) inValid = inValid + "title "
        if ( !isValid ( category ) ) inValid = inValid + "category "
        if ( !isValid(authorId) || !isValid(body) || !isValid(title) || !isValid(category) ) {
            return res.status(400).send({ status: false, msg: `Enter valid details in following field(s): ${inValid}` })
        }
        
        let authorFound = await authorModel.findById({ _id: authorId })  // to check if the provided authorId is present in the database.
        if ( !authorFound ) {
            return res.status(400).send({ status: false, msg: "Author is not present." })  // --> when authorId is not available in the database.
        }

        if (!blogData.isPublished || blogData.isPublished == false) {    // --> if isPublished is false or not provided.
            blogData.publishedAt = null
            let blogCreated = await blogModel.create(blogData)
            res.status(201).send({ status: true, data: blogCreated })
        } else {                                                         // --> if isPublished is true.
            blogData.publishedAt = new Date()
            let blogCreated = await blogModel.create(blogData)           // to create the blog
            res.status(201).send({ status: true, data: blogCreated })    // created is shown in the response body.
        }
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

// ==> GET api: to get all the blogs that are published and not deleted and applying the filters also

const getBlogs = async function (req, res) {
    try {
        let filters = req.query  // filters are provided in the query params
        const { category, authorId, tags, subcategory } = filters  // destructuring the object. 

        // validations for the details provided in the query params.
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

        let mandatory = { isDeleted: false, isPublished: true, ...filters }  // --> combining the provided details alongwith the mandatory fields.

        // finding all the blogs as per the mandatory fields and filters.
        let getBlogs = await blogModel.find( mandatory )

        // if no blog is found.
        if ( getBlogs.length === 0 ) return res.status(404).send({ status: false, msg: `No such blog exists.` })

        return res.status(201).send({ status: true, data: getBlogs })  // --> existing blogs are reflected in the response body.
    } catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}

// ==> PUT api: Update a blog

const updateBlog = async function (req, res) {
    try {
        let blog = await blogModel.findById(req.params.blogId)
        if ( blog.isDeleted == true ) return res.status(400).send({ status: false, msg: "This blog is already deleted." })
        let data = req.body
        const { title, body, tags, subcategory } = data  // --> destructuring the data provided in the body
        
        // if no data is provided in the body to update.
        if (Object.keys(data).length === 0) return res.status(400).send({ status: false, msg: "Provide the data in body to update."})
        
        // if data is provided in the body to update.
        let updatedBlog = await blogModel.findOneAndUpdate(
            { _id: req.params.blogId },
            { $set: { title: title, body: body, isPublished: true, publishedAt: new Date() }, $push: { tags: tags, subcategory: subcategory } },
            { new: true });
        return res.status(201).send({ status: true, data: updatedBlog })
    } catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
    
}


// ==> DELETE api: Deleting a blog by its _id in the path params
   
const deleteBlogByid = async function(req, res) {
    try {
        // authroization 
        const data = await blogModel.findOne({ _id: req.params.blogId, isDeleted: false });
        if (!data) {
            res.status(404).send({ status: false, msg: "blog does not exist or already deleted" });
        }

        if (!data.authorId == req.header.tokenId) {
            res.status(400).send({ status: false, msg: "please provide token" })
        }

        let deleteBlog = await blogModel.findOneAndUpdate({ _id: req.params.blogId }, { isDeleted: true, deletedAt: new Date() }, { new: true });
        res.status(200).send({ status: true, msg: "sucessfully deleted", data: deleteBlog });

    } catch (error) {

        res.status(500).send({ status: false, msg: error.message });
    }
}
// ==> DELETE api: Deleting the blog(s) by the fields provided in the query params

const deleteByQuery = async function (req, res) {
    try {
        let data = req.query
        data.authorId = req.authorId
        
        let mandatory = { isDeleted: false, isPublished: false, ...data };

        let findBlogs = await blogModel.find( mandatory )
        if ( findBlogs.length === 0 ) return res.status(400).send({ status: false, msg: "No such blog found to delete." })

        let deleted = await blogModel.updateMany( mandatory, { isDeleted: true, deletedAt: new Date() }, { new: true } )
        return res.status(200).send({ status: true, data: deleted })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
    
}





// exporting all the functions
module.exports.createBlog = createBlog
module.exports.deleteBlogByid = deleteBlogByid
module.exports.updateBlog = updateBlog
module.exports.deleteByQuery = deleteByQuery
module.exports.getBlogs = getBlogs
