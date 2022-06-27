const jwt = require("jsonwebtoken");

let decodedToken

const authenticate = async function (req, res, next) {
    try {
        let token = req.headers["x-api-key"]
        if ( !token ) return res.status(400).send( { status: false, msg: "token must be present in request header."} )
        decodedToken = jwt.verify(token, 'avinash-ajit-manish-nikhilesh')
        if(!decodedToken) return res.status(400).send({status: false, msg: "Invalid token."})
        next()
    } catch (err) {
        return res.status(500).send( { status: false, error: err.message} )
    }
}

const authorize = async function (req, res, next) {
    try {
        let authorRequested = req.query.authorId
        let authorLoggedin = decodedToken.authorId
        if (authorRequested !== authorLoggedin) return res.status(403).send( { status: false, msg: "Not authorized." } )
        next()
    } catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}

module.exports.authenticate = authenticate
module.exports.authorize = authorize