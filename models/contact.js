const {Schema, model} = require("mongoose");
const {handleMongoosError} = require("../helpers")

const contactSchema = new Schema ({
    name: {
        type: String,
        required: [true, 'Set name for contact'],
      },
      email: {
        type: String,
      },
      phone: {
        type: String,
      },
      favorite: {
        type: Boolean,
        default: false,
      },
});
const Contact = model("contact", contactSchema);

contactSchema.post("save", handleMongoosError);

const Joi = require("joi")


const addSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.number().required(),
  favorite: Joi.boolean(),
})

const updateFavoriteSchema = Joi.object({
    favorite:Joi.boolean().required(),
})

const schema = {
    addSchema,
    updateFavoriteSchema,
}

module.exports = {
    Contact,
    schema
}