const authorModel = require("../models/authorModel")  // importing the module that contains the author schema
const jwt = require("jsonwebtoken");  // importing the jsonwebtoken so as to generate the token for the author after successful login
const validator = require("email-validator");  // importing the package in order to identify a valid email.

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

// api to create author 
const createAuthor = async function(req, res) {
    try {
        let requestBody = req.body

        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide author details' })
            return
        }
        if (!isValid(requestBody.fname)) {
            res.status(400).send({ status: false, message: 'First name is required' })
            return
        }

        if (!isValid(requestBody.lname)) {
            res.status(400).send({ status: false, message: 'Last name is required' })
            return
        }

        if (!isValid(requestBody.title)) {
            res.status(400).send({ status: false, message: 'Title is required' })
            return
        }

        if (!isValid(requestBody.email)) {
            res.status(400).send({ status: false, message: 'email is required' })
            return
        }
        if (!isValid(requestBody.password)) {
            res.status(400).send({ status: false, message: 'password is required' })
            return
        }
        if (!(validator(requestBody.email))) {
            return res.status(400).send({ status: false, msg: 'enter valid email' })
        }

        const isEmailAlreadyUsed = await authorModel.findOne({ email: requestBody.email });


        if (isEmailAlreadyUsed) {
            res.status(400).send({ status: false, message: `${requestBody.email} email address is already registered` })
            return
        }

        let createdAuthor = await authorModel.create(requestBody);
        res.status(201).send({ status: true, msg: `Author created successfully`, data: createdAuthor });

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message });
    }
};




// ==> POST api: Login for an author

const loginAuthor = async function (req, res) {
    try {
        let email = req.body.email
        let password = req.body.password
        if ( !email || !password ) return res.status(400).send({ status: false, msg: "Provide the email and password." })  // if either email, password or both not present in the request body.

        let validEmail = validator.validate(email)  // to validate the email by the use of package
        if ( validEmail == false ) return res.status(400).send({ status: false, msg: "Email is not valid."})  // if email is not validated.

        let author = await authorModel.findOne( { email: email, password: password } )  // to find that particular author document.
        if ( !author ) return res.status(403).send({ status: false, msg: "Email or password is incorrect." })  // if the author document isn't found in the database.

        let token = jwt.sign(  // --> to generate the jwt token
            {
                authorId: author._id.toString(),          // --> payload
                project: "Blogging Site Mini Project",
                batch: "Radon"
            },
            "avinash-ajit-manish-nikhilesh"               // --> secret key
        )
        res.setHeader("x-api-key", token)  // to send the token in the header of the browser used by the author(user).
        res.status(200).send({ status: true, token: token })  // token is shown in the response body.
    } catch (err) {
        res.status(500).send({ status: false, err: err.message })
    }
}



// exporting all the functions
module.exports.createAuthor = createAuthor
module.exports.loginAuthor = loginAuthor