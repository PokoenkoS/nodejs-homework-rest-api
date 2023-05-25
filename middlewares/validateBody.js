const {HttpError} = require("../helpers");

const {isValidObjectId} =require("mongoose");

const validateBody = schema => {
    const func = (req, res, next)=> {
        const { error } = schema.validate(req.body);
        if (error) {
            next(HttpError(400, error.message));
        }
        next()
    }

    return func;
}



const isValidId = (req,res, next) =>{
    const {id} = req.params;
    if(!isValidObjectId(id)) {
        next(HttpError(400, `${id} is not valid id`))
    }
    next();
}

module.exports ={
    validateBody,
    isValidId
} 