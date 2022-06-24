const authorModel = require("../models/authorModel")
const jwt = require("jsonwebtoken");
const validator = require("email-validator");


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
        if (!(validator.validate(requestBody.email))) {
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

const loginAuthor = async function (req, res) {
    try {
        let email = req.body.email
        let password = req.body.password
        if ( !email || !password ) return res.status(400).send({status: false, msg: "Provide the email and password."})

        let validEmail = validator.validate(email)
        if ( validEmail == false ) return res.status(400).send({ status: false, msg: "Email is not valid."})

        let author = await authorModel.findOne( { email: email, password: password } )
        if ( !author ) return res.status(403).send( { status: false, msg: "Email or password is incorrect."})

        let token = jwt.sign(
            {
                authorId: author._id.toString(),
                project: "Blogging Site Mini Project",
                batch: "Radon"
            },
            "avinash-ajit-manish-nikhilesh"
        )
        res.setHeader("x-api-key", token)
        res.status(200).send({ status: true, token: token})
    } catch (err) {
        res.status(500).send({ status: false, err: err.message })
    }
}



module.exports.createAuthor = createAuthor
module.exports.loginAuthor = loginAuthor