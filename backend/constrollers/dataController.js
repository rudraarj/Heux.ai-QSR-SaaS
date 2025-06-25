const {addrestaurantSchema,addrecipientSchema, addsectionSchema, addquestionSchema, updaterecipientSchema, updateQuestionSchema } = require("../middlewares/validator")
const employeesModule = require("../models/employeesModule")
const inspectionsModule = require("../models/inspectionsModule")
const notificationModule = require("../models/notificationModule")
const restaurantModule = require("../models/restaurantModule")
const sectionModule = require("../models/sectionModule")
const axios = require('axios'); 

exports.getWebhook = (req,res)=>{
    const mode = req.query['hub.mode']
    const challenge = req.query['hub.challenge']
    const token = req.query['hub.verify_token']
  
    if (mode && token === process.env.WEBHOOK_VERIFY_TOKEN) {
      res.status(200).send(challenge)
    } else {
      res.sendStatus(403)
    }
}

exports.fetchdata = async(req,res)=>{
const userId = req.userId
  try {
   const inspection = await inspectionsModule.find({userId:userId})
   const employees = await employeesModule.find({userId:userId})
   const restaurant = await restaurantModule.find({userId:userId})
   const section = await sectionModule.find({userId:userId})
   return res.status(200).send({
    inspection,
    employees,
    restaurant,
    section
  });
  } catch (error) {
    return res.status(400).json({
        success:false,
        message:'some thing went wrong in while fetch data',
        error
    })
  }
}

exports.inspectionRec = async(req,res) =>{
    try {
        const data = req.body
        console.log(data)
        const userId = req.userId
        const checkboxKey = Object.keys(data).find(key => key.startsWith("section"));
        const optionsArray = data[checkboxKey];
        const chat_id = data.chat_id

        const employees = await employeesModule.findOne({whatsappNumber: chat_id});
        if(!employees){
            return res.status(401).json({
                success:false,
                message: "this employee don't exist"
            })
        }
        const section = await sectionModule.findOne({id: checkboxKey})
        if(!section){
            return res.status(401).json({
                success:false,
                message: "this section don't exist"
            })
        }
            if (!employees.sectionIds.includes(checkboxKey)) {
                return res.status(401).json({
                    success: false,
                    message: "This employee doesn't fall into this section"
                });
            }
        const allOptions = section.questions
        const responses = allOptions.map(option => ({
        questionId: option.id,
        passed: optionsArray.includes(option.id)
        }));
        const allPassed = responses.every(responses => responses.passed)
        const inspData = new inspectionsModule({
                 id:`inspection-${Date.now()}`,
                 userId:userId,
                 sectionId:checkboxKey,
                 employeeId:employees.id,
                 date:Date.now(),
                 status: allPassed ?'passed':'attention',
                 responses
              })
              await inspData.save();
              const result = await inspectionsModule.find({userId:userId,})
              return res.status(201).json({
                  success:true,
                  message:'Your inspection has been created',
                  result
              })

    } catch (error) {
        return res.status(400).json({
            success:false,
            message:"some thing want wrong",
            error
        })
    }
  }

exports.addRestaurant = async (req, res) => {
  try {
    const { id, name, location } = req.body;
    const userId = req.userId;
    
    // Use uploaded file path
    const image = req.file?.path;
    console.log(image)

    const { value, error } = addrestaurantSchema.validate({ id, name, location, image });
    if (error) {
      return res.status(401).json({
        success: false,
        message: error.details[0].message
      });
    }

    const existingUser = await restaurantModule.findOne({ id });
    if (existingUser) {
      return res.status(201).json({
        success: false,
        message: "Restaurant already exists"
      });
    }

    const newUser = new restaurantModule({
      id,
      userId,
      name,
      location,
      image, // saved path like "uploads/1682392932.jpg"
    });

    await newUser.save();

    const allRestaurant = await restaurantModule.find({ userId });
    return res.status(201).json({
      success: true,
      message: 'Your restaurant has been created',
      allRestaurant
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Something went wrong',
      error
    });
  }
};

exports.addSection = async(req,res)=>{

   try {
    const userId = req.userId
    const { value, error } = addsectionSchema.validate(req.body);
            if(error){ 
                return res.status(401).json({
                       success:false, message: error.details[0].message
                })
            }
            const Id = value.id
            const existingUser = await sectionModule.findOne({Id})
     
            if(existingUser){
                return res.status(201).json({
                   success:false,
                   message:"section already exist"
                })
            }
             const newUser = new sectionModule({
                id: value.id,
                name: value.name,
                userId:userId,
                restaurantId: value.restaurantId,
                frequency: value.frequency,
                questions: value.questions || []
              })
             await newUser.save();
             const allSection = await sectionModule.find({userId:userId,})
                 return res.status(201).json({
                     success:true,
                     message:'Your sections has been created',
                     allSection
                 })

   } catch (error) {
    return res.status(400).json({
        success:false,
        message:'some thing went wrong',
        error
    })
   }

}

exports.addrecipient = async(req,res)=>{
  const {id,name,whatsappNumber,employeeId,restaurantId,sectionIds,image} = req.body;
      try {
        const userId = req.userId
          const {error, value} = addrecipientSchema.validate({id,name,whatsappNumber,employeeId,restaurantId,sectionIds,image});
           
          if(error){
              return res.status(401).json({
                  success:false, message: error.details[0].message
              })
          }
          const existingUser = await employeesModule.findOne({
              whatsappNumber
          })

          if(existingUser){
              return res.status(201).json({
                  success:false,
                  message:"User already exist"
              })
          }
        
        const newUser = new employeesModule({
          id,
          userId:userId,
          name,
          whatsappNumber,
          employeeId,
          restaurantId,
          sectionIds,
          image,
            })
            await newUser.save();
            const allemployee = await employeesModule.find({userId:userId,})
            return res.status(200).json({
                success:true,
                message:'Your recipient has been created',
                allemployee
            })
        }catch(error){
            return res.status(400).json({
                success:false,
                message:'some thing went wrong',
                error
            })
        }
}

exports.addquestions = async(req,res)=>{
    try {
        const { id, text, sectionId } = req.body;
        const {value,error} = addquestionSchema.validate({id,text,sectionId});
        if(error){ 
           return res.status(400).json({
                success:false,
                message:'some thing went wrong',
                error
            })
        }
        await sectionModule.findOneAndUpdate(
            { id: sectionId },
            { $push: { questions: { id, text, sectionId } } },
            { new: true }
        )
        const section = await sectionModule.findOne({id:sectionId})
        const questions = section.questions
        return res.status(200).json({
                success:true,
                message: 'Question added',
                questions
        })
    } catch (error) {
       return res.status(400).json({
            success:false,
            message:'some thing went wrong',
            error
        })
    }
}

exports.newNotification = async (req,res)=>{
    try {
        const {frequency,id,isActive,restaurantId,sectionId,time,timeZone} = req.body;
        const userId = req.userId
        const exisitingNotification = await notificationModule.findOne({id})
        if(exisitingNotification){
            return res.status(400).json({
                success:false,
                message:'some thing went wrong',
                error
            })
        }

        const newNotification = new notificationModule({
            frequency,id,userId:userId,isActive,restaurantId,sectionId,time,timeZone
              })
        await newNotification.save();
        const allNotification = await notificationModule.find({userId:userId,})
              return res.status(201).json({
                  success:true,
                  message:'Your notificatoin has been created',
                  allNotification
              })
    } catch (error) {
        return res.status(400).json({
            success:false,
            message:'some thing went wrong in notification',
            error
        })
    }
}

exports.getnotification = async (req,res)=>{
    try {
        const userId = req.userId
        const allNotification = await notificationModule.find({userId:userId,});
        return res.status(201).json({
            success:true,
            allNotification
        })
    } catch (error) {
        return res.status(400).json({
            success:false,
            message:'some thing went wrong in notification',
            error
        })
    }
}

exports.updateEmployee = async(req,res)=>{
    try {
    const {id,name,whatsappNumber,restaurantId,sectionIds} = req.body;
          const {error, value} = updaterecipientSchema.validate({id,name,whatsappNumber,restaurantId,sectionIds});
           
          if(error){
              return res.status(401).json({
                  success:false, message: error.details[0].message
              })
          }
    const user = await employeesModule.findOneAndUpdate({id:id},
    {
        name,
        whatsappNumber,
        restaurantId,
        sectionIds,
    })
    return res.status(201).json({
        success:true,
        message:'Your employee has been updated',
        user
    })
    } catch (error) {
        return res.status(400).json({
            success:false,
            message:'some thing went wrong in notification',
            error
        })  
    }
}

exports.updatequestion = async (req, res) => {
     try {
        const { id, text, sectionId } = req.body;
        
        // Validate the input (assuming you have an updateQuestionSchema)
        const { value, error } = updateQuestionSchema.validate({ id, text, sectionId });
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Something went wrong',
                error
            });
        }

        // Update the specific question in the questions array
        const updatedSection = await sectionModule.findOneAndUpdate(
            { 
                id: sectionId,
                "questions.id": id  // Find the section and the specific question
            },
            { 
                $set: { 
                    "questions.$.text": text  // Update only the text field of the matched question
                }
            },
            { new: true }
        );

        // Check if the section was found and updated
        if (!updatedSection) {
            return res.status(404).json({
                success: false,
                message: 'Section or question not found'
            });
        }

        const questions = updatedSection.questions;
        
        return res.status(200).json({
            success: true,
            message: 'Question updated successfully',
            questions
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Something went wrong',
            error
        });
    }
};

exports.triggerNotification = async (req,res)=>{
     try {
        const { sectionId } = req.body;
        const userId = req.userId;

        // Validate required fields
        if (!sectionId) {
            return res.status(400).json({
                success: false,
                message: 'Section ID is required'
            });
        }

        // Find all employees assigned to this section and get phone numbers and names
        const employees = await employeesModule.find({
            sectionIds: { $in: [sectionId] } // Since sectionIds is an array
        }).select('whatsappNumber name');

        // Extract employee data (phone numbers and names)
        const employeeData = employees
            .filter(employee => employee.whatsappNumber && employee.name) // Remove any null/undefined values
            .map(employee => ({
                phoneNumber: employee.whatsappNumber,
                name: employee.name
            }));

        // If no employees found for this section
        if (employeeData.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No employees assigned to this section',
                employees: []
            });
        }

 // Webhook URL
        const webhookUrl = 'https://graph.facebook.com/v19.0/715935278261566/messages';
        
        // Trigger webhook for each employee
        const webhookResults = [];
        
        for (const employee of employeeData) {
            try {
                const webhookPayload = {
                    messaging_product: "whatsapp",
                    to: employee.phoneNumber,
                    type: "template",
                    template: {
                        name: "feedbackform",
                        language: {
                            code: "en"
                        },
                        components: [
                            {
                                type: "button",
                                sub_type: "flow",
                                index: "0",
                                parameters: [
                                    {
                                        type: "text",
                                        text: "feedbackform"
                                    }
                                ]
                            }
                        ]
                    }
                };

                const response = await axios({
                    url: webhookUrl,
                    method: 'post',
                    headers: {
                        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    data: webhookPayload
                });

    webhookResults.push({
      phoneNumber: employee.phoneNumber,
      name: employee.name,
      status: 'success',
      response: response.status
    });

                console.log(`Webhook triggered successfully for ${employee.name} (${employee.phoneNumber})`);
                
                // Optional: Add delay between requests to avoid rate limiting
                 await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.error(`Failed to trigger webhook for ${employee.name} (${employee.phoneNumber}):`, error.message);
                webhookResults.push({
                    phoneNumber: employee.phoneNumber,
                    name: employee.name,
                    status: 'failed',
                    error: error.message
                });
            }
        }

        // Count successful and failed requests
        const successful = webhookResults.filter(result => result.status === 'success').length;
        const failed = webhookResults.filter(result => result.status === 'failed').length;

        return res.status(200).json({
            success: true,
            message: `Notifications triggered for ${employeeData.length} employee(s)`,
            summary: {
                total: employeeData.length,
                successful: successful,
                failed: failed
            },
            employees: employeeData,
            webhookResults: webhookResults
        });

    } catch (error) {
        console.error('Error in triggerNotification:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong in notification',
            error: error.message
        });
    }
}