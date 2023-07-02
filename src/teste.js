import Joi from 'joi';
import dayjs from 'dayjs';

const schemamsg = Joi.object({
    to: Joi.string().min(1),
    text: Joi.string().min(1),
    type: Joi.string().valid("message", "private-message"),
});

const data = { to: "as", text: "as", type: "message" };
const validate = schemamsg.validate(data, { abortEarly: false });
if (validate.error) {
    console.log("inválido");
} else {
    console.log("Certo");
}
