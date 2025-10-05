const joi = require('joi')

exports.signupSchema = joi.object({
    email: joi.string()
        .min(6)
        .max(60)
        .required()
        .email({
            tlds:{allow: ['com', 'net']},
        }),
    password: joi.string()
            .required()
            .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$'))
            .message(
              `Enter correct password. Requirements:\n- Minimum 6 characters\n- At least one capital letter\n- At least one number\n- At least one special character`
            )
}) 

exports.signinSchema = joi.object({
    email: joi.string()
        .min(6)
        .max(60)
        .required()
        .email({
            tlds:{allow: ['com', 'net']},
        }),
    password: joi.string()
            .required()
            .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$'))
            .message(
              `Enter correct password. Requirements:\n- Minimum 6 characters\n- At least one capital letter\n- At least one number\n- At least one special character`
            )
}) 

exports.acceptCodeSchema = joi.object({
    email: joi.string()
        .min(6)
        .max(60)
        .required()
        .email({
            tlds:{allow: ['com', 'net']},
        }),
        providedCode: joi.number().required() 
})

exports.changePasswordSchema = joi.object({
	newPassword: joi.string()
		.required()
		.pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$')),
	oldPassword: joi.string()
		.required()
		.pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$')),
});

exports.acceptFPCodeSchema = joi.object({
	email: joi.string()
		.min(6)
		.max(60)
		.required()
		.email({
			tlds: { allow: ['com', 'net'] },
		}),
	providedCode: joi.number().required(),
	newPassword: joi.string()
		.required()
		.pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$')),
});

exports.addrecipientSchema = joi.object({
    id:joi.string()
    .required(),
    name:joi.string()
    .required(),
    employeeId:joi.string()
    .required(),
    restaurantId:joi.string()
    .required(),
    sectionIds: joi.array()
    .items(joi.string()),
    image:joi.string()
    .required(),
    whatsappNumber: joi.string()
            .messages({'string.pattern.base': `Phone number must have 10 digits.`})
            .required(),
	});
exports.updaterecipientSchema = joi.object({
    id:joi.string()
    .required(),
    name:joi.string()
    .required(),
    restaurantId:joi.string()
    .required(),
    sectionIds: joi.array()
    .items(joi.string()),
    whatsappNumber: joi.string()
            .messages({'string.pattern.base': `Phone number must have 10 digits.`})
            .required(),
	});

exports.addrestaurantSchema = joi.object({
        id: joi.string().required(),
        name: joi.string().required(),
        location: joi.string().required(),
        image: joi.string().optional()
      });

const questionSchema = joi.object({
  id: joi.string().required(),
  text: joi.string().required(),
  sectionId: joi.string().required()
})
      
exports.addsectionSchema = joi.object({
        id: joi.string().required(),
        name: joi.string().required().messages({
          'any.required': 'Name is required!'
        }),
        restaurantId: joi.string().required().messages({
          'any.required': 'Restaurant ID is required!'
        }),
        frequency: joi.string().valid('daily', 'twice-daily', 'custom').required().messages({
          'any.required': 'Frequency is required!',
          'any.only': 'Frequency must be one of daily, twice-daily, or custom'
        }),
        questions: joi.array().items(questionSchema).default([])
      });

exports.addquestionSchema = joi.object({
        id: joi.string().required(),
        text: joi.string().required().messages({
          'any.required': 'text is required!'
        }),
        sectionId: joi.string().required()
      });