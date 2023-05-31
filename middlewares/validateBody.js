<<<<<<< HEAD
const {HttpError} = require("../../helpers");
=======
const {HttpError} = require("../helpers");
>>>>>>> d21917d2224ecfab74a7eb3b194385fc4e132463

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

module.exports = validateBody;