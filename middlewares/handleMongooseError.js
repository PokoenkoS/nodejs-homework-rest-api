<<<<<<< HEAD
const handleMongooseError = (error, data, next) => {
    error.status = 400;
    next()
}
module.exports = handleMongooseError
=======
const handleMongooseError =(error,data,next) =>{
    error.status = 400;
    next()
}
module.exports = handleMongooseError
    
>>>>>>> d21917d2224ecfab74a7eb3b194385fc4e132463
