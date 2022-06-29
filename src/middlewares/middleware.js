const jwt = require("jsonwebtoken");  // importing the jsonwebtoken so as to authenticate and authorize the author.

let decodedToken



// ==> Authentication middleware function

const authenticate = async function (req, res, next) {
    try {
        let token = req.headers["x-api-key"]  // --> token is picked from the headers section of the request
        if ( !token ) return res.status(400).send( { status: false, msg: "token must be present in request header."} )  // --> if token is not present in the headers
        decodedToken = jwt.verify(token, 'avinash-ajit-manish-nikhilesh')  // --> token is verified using the secret key
        if(!decodedToken) return res.status(400).send({status: false, msg: "Invalid token."})
        next()  // --> next function is called after successful verification of the token, either another middleware (in case of PUT and DELETE api) or root handler function.
    } catch (err) {
        return res.status(500).send( { status: false, error: err.message} )
    }
}



// ==> Authorization middleware function

const authorize = async function (req, res, next) {
    try {
        let authorRequested = req.query.authorId  // --> authorId is provided in the query params to match with the one whose token is provided in the headers.
        let authorLoggedin = decodedToken.authorId  // --> logged in author's authorId is extracted here.
        if (authorRequested !== authorLoggedin) return res.status(401).send( { status: false, msg: "Not authorized." } )  // --> if both don't match.
        next()  // --> next function is called when it is evident that the logged-in author is authorized.
    } catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}

module.exports.authenticate = authenticate
module.exports.authorize = authorize