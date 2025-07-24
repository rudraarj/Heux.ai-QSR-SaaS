const {addrestaurantSchema,addrecipientSchema, addsectionSchema, addquestionSchema, updaterecipientSchema, updateQuestionSchema } = require("../middlewares/validator")
const employeesModule = require("../models/employeesModule")
const inspectionsModule = require("../models/inspectionsModule")
const notificationModule = require("../models/notificationModule")
const restaurantModule = require("../models/restaurantModule")
const sectionModule = require("../models/sectionModule")
// const notificationScheduler = require("../utils/NotificationScheduler")
const { scheduler: notificationScheduler } = require('../utils/NotificationScheduler');
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
        const userId = '685dbf18a480be5c569d1a01'
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
            // if (!employees.sectionIds.includes(checkboxKey)) {
            //     return res.status(401).json({
            //         success: false,
            //         message: "This employee doesn't fall into this section"
            //     });
            // }
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
              console.log(result)
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

exports.deleteSection = async (req,res)=>{

     try {
        const { id } = req.body;
        const userId = req.userId;

        // Verify the notification belongs to the user
        const section = await sectionModule.findOne({id});
        if (!section) {
            return res.status(404).json({
                success: false,
                message: 'section not found'
            });
        }
        await sectionModule.findOneAndDelete({ id: id});

        // Get remaining notifications
        const allSection = await sectionModule.find({ userId });

        return res.status(200).json({
            success: true,
            message: 'section deleted successfully',
            allSection: allSection
        });

    } catch (error) {
        console.error('Error deleting section:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting section',
            error: error.message
        });
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

exports.deleteEmployee = async (req,res)=>{

    try {
        const { id } = req.body;
        const userId = req.userId;

        // Verify the notification belongs to the user
        const employee = await employeesModule.findOne({id});
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'employee not found'
            });
        }
        await employeesModule.findOneAndDelete({ id: id});

        // Get remaining notifications
        const allEmployee = await employeesModule.find({ userId });

        return res.status(200).json({
            success: true,
            message: 'employee deleted successfully',
            allEmployee: allEmployee
        });

    } catch (error) {
        console.error('Error deleting employee:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting employee',
            error: error.message
        });
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

exports.deleteQuestion = async (req,res)=>{
const { sectionId, questionId } = req.body.data;
const userId = req.userId;


  if (!userId) {
    return res.status(400).json({ success: false, message: 'Section ID and Question ID are required' });
  }
  if (!sectionId || !questionId) {
    return res.status(400).json({ success: false, message: 'Section ID and Question ID are required' });
  }

  try {
    const updatedSection = await sectionModule.findOneAndUpdate(
      { id: sectionId },
      { $pull: { questions: { id: questionId } } },
      { new: true }
    );

    if (!updatedSection) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Question deleted successfully',
      allquestion: updatedSection,
    });
  } catch (err) {
    console.error('Error deleting question:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

exports.createNotification = async (req, res) => {
    try {
        const { restaurantId, sectionId, frequency, time, timeZone } = req.body;
        const userId = req.userId;

        // Validate required fields
        if (!restaurantId || !sectionId || !frequency || !time || !timeZone) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Create notification data
        const notificationData = {
            id: `notification-${Date.now()}`,
            userId,
            restaurantId,
            sectionId,
            frequency,
            time,
            timeZone,
            isActive: true,
            createdAt: new Date()
        };

        // Add notification using scheduler (this will save to DB and schedule)
        const notification = await notificationScheduler.addNotification(notificationData);

        // Get all notifications for response
        const allNotifications = await notificationModule.find({ userId });

        return res.status(201).json({
            success: true,
            message: 'Notification created and scheduled successfully',
            notification,
            allNotification: allNotifications
        });

    } catch (error) {
        console.error('Error creating notification:', error);
        return res.status(500).json({
            success: false,
            message: 'Error creating notification',
            error: error.message
        });
    }
};

// Get all notifications
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.userId;
        const notifications = await notificationModule.find({ userId });

        return res.status(200).json({
            success: true,
            allNotification: notifications
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching notifications',
            error: error.message
        });
    }
};

// Delete notification endpoint
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        // Verify the notification belongs to the user
        const notification = await notificationModule.findOne({ id, userId });
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        // Delete notification using scheduler (this will cancel schedule and remove from DB)
        await notificationScheduler.deleteNotification(id);

        // Get remaining notifications
        const allNotifications = await notificationModule.find({ userId });

        return res.status(200).json({
            success: true,
            message: 'Notification deleted successfully',
            allNotification: allNotifications
        });

    } catch (error) {
        console.error('Error deleting notification:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting notification',
            error: error.message
        });
    }
};


// Your existing triggerNotification function remains the same
exports.triggerNotification = async (req, res) => {
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

        // Find all employees assigned to this section
        const employees = await employeesModule.find({
            sectionIds: { $in: [sectionId] }
        }).select('whatsappNumber name');

        // Format phone number function
        const formatPhoneNumber = (phoneNumber) => {
            let cleaned = phoneNumber.replace(/\D/g, '');
            
            if (cleaned.startsWith('0')) {
                cleaned = '91' + cleaned.substring(1);
            } else if (cleaned.length === 10) {
                cleaned = '91' + cleaned;
            }
            
            return cleaned;
        };

        // Extract and validate employee data
        const employeeData = employees
            .filter(employee => employee.whatsappNumber && employee.name)
            .map(employee => ({
                phoneNumber: formatPhoneNumber(employee.whatsappNumber), // Format the number
                name: employee.name,
                originalNumber: employee.whatsappNumber // Keep original for reference
            }));

        if (employeeData.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No employees assigned to this section',
                employees: []
            });
        }

        const webhookUrl = 'https://hook.eu1.make.com/i6113732rlenl9ih4om42k9k156nv7fn';
        const webhookResults = [];
        
        for (const employee of employeeData) {
            try {
                const webhookPayload = {
                    name: employee.name,
                    phonenumber: employee.phoneNumber, // Using formatted number
                };

                console.log(`Sending WhatsApp message to: ${employee.phoneNumber} (original: ${employee.originalNumber})`);
                console.log('Payload:', JSON.stringify(webhookPayload, null, 2));

                const response = await axios({
                    url: webhookUrl,
                    method: 'post',
                    data: webhookPayload,
                    timeout: 1000 // 30 second timeout
                });

                // Log the full response for debugging
                console.log(`WhatsApp API Response for ${employee.name}:`, {
                    status: response.status,
                    statusText: response.statusText,
                    data: response.data,
                    headers: response.headers
                });

                webhookResults.push({
                    phoneNumber: employee.phoneNumber,
                    originalNumber: employee.originalNumber,
                    name: employee.name,
                    status: 'success',
                    response: response.status,
                    messageId: response.data?.messages?.[0]?.id,
                    whatsappResponse: response.data
                });

                console.log(`Webhook triggered successfully for ${employee.name} (${employee.phoneNumber})`);
                
                // Add delay between requests
                await new Promise(resolve => setTimeout(resolve, 2000)); // Reduced to 2 seconds
                
            } catch (error) {
                console.error(`Failed to trigger webhook for ${employee.name} (${employee.phoneNumber}):`, {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                    statusText: error.response?.statusText
                });
                
                webhookResults.push({
                    phoneNumber: employee.phoneNumber,
                    originalNumber: employee.originalNumber,
                    name: employee.name,
                    status: 'failed',
                    error: error.message,
                    errorDetails: error.response?.data,
                    errorStatus: error.response?.status
                });
            }
        }

        const successful = webhookResults.filter(result => result.status === 'success').length;
        const failed = webhookResults.filter(result => result.status === 'failed').length;

        return res.status(200).json({
            success: true,
            message: `Notifications processed for ${employeeData.length} employee(s)`,
            summary: {
                total: employeeData.length,
                successful: successful,
                failed: failed
            },
            employees: employeeData,
            webhookResults: webhookResults,
            debug: {
                accessToken: process.env.WHATSAPP_ACCESS_TOKEN ? 'Present' : 'Missing',
                webhookUrl: webhookUrl
            }
        });

    } catch (error) {
        console.error('Error in triggerNotification:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong in notification',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
// exports.triggerNotification = async (req, res) => {
//     try {
//         const { sectionId } = req.body;
//         const userId = req.userId;

//         // Validate required fields
//         if (!sectionId) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Section ID is required'
//             });
//         }

//         // Find all employees assigned to this section
//         const employees = await employeesModule.find({
//             sectionIds: { $in: [sectionId] }
//         }).select('whatsappNumber name');

//         // Format phone number function
//         const formatPhoneNumber = (phoneNumber) => {
//             let cleaned = phoneNumber.replace(/\D/g, '');
            
//             if (cleaned.startsWith('0')) {
//                 cleaned = '91' + cleaned.substring(1);
//             } else if (cleaned.length === 10) {
//                 cleaned = '91' + cleaned;
//             }
            
//             return cleaned;
//         };

//         // Extract and validate employee data
//         const employeeData = employees
//             .filter(employee => employee.whatsappNumber && employee.name)
//             .map(employee => ({
//                 phoneNumber: formatPhoneNumber(employee.whatsappNumber), // Format the number
//                 name: employee.name,
//                 originalNumber: employee.whatsappNumber // Keep original for reference
//             }));

//         if (employeeData.length === 0) {
//             return res.status(200).json({
//                 success: true,
//                 message: 'No employees assigned to this section',
//                 employees: []
//             });
//         }

//         const webhookUrl = 'https://graph.facebook.com/v23.0/715935278261566/messages';
//         const webhookResults = [];
        
//         for (const employee of employeeData) {
//             try {
//                 const webhookPayload = {
//                     messaging_product: "whatsapp",
//                     to: employee.phoneNumber, // Using formatted number
//                     type: "template",
//                     template: {
//                         name: "feedbackform",
//                         language: {
//                             code: "en"
//                         },
//                         components: [
//                             {
//                                 type: "button",
//                                 sub_type: "flow",
//                                 index: "0",
//                                 parameters: [
//                                     {
//                                         type: "text",
//                                         text: "feedbackform"
//                                     }
//                                 ]
//                             }
//                         ]
//                     }
//                 };

//                 console.log(`Sending WhatsApp message to: ${employee.phoneNumber} (original: ${employee.originalNumber})`);
//                 console.log('Payload:', JSON.stringify(webhookPayload, null, 2));

//                 const response = await axios({
//                     url: webhookUrl,
//                     method: 'post',
//                     headers: {
//                         'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
//                         'Content-Type': 'application/json'
//                     },
//                     data: webhookPayload,
//                     timeout: 1000 // 30 second timeout
//                 });

//                 // Log the full response for debugging
//                 console.log(`WhatsApp API Response for ${employee.name}:`, {
//                     status: response.status,
//                     statusText: response.statusText,
//                     data: response.data,
//                     headers: response.headers
//                 });

//                 webhookResults.push({
//                     phoneNumber: employee.phoneNumber,
//                     originalNumber: employee.originalNumber,
//                     name: employee.name,
//                     status: 'success',
//                     response: response.status,
//                     messageId: response.data?.messages?.[0]?.id,
//                     whatsappResponse: response.data
//                 });

//                 console.log(`Webhook triggered successfully for ${employee.name} (${employee.phoneNumber})`);
                
//                 // Add delay between requests
//                 await new Promise(resolve => setTimeout(resolve, 2000)); // Reduced to 2 seconds
                
//             } catch (error) {
//                 console.error(`Failed to trigger webhook for ${employee.name} (${employee.phoneNumber}):`, {
//                     message: error.message,
//                     response: error.response?.data,
//                     status: error.response?.status,
//                     statusText: error.response?.statusText
//                 });
                
//                 webhookResults.push({
//                     phoneNumber: employee.phoneNumber,
//                     originalNumber: employee.originalNumber,
//                     name: employee.name,
//                     status: 'failed',
//                     error: error.message,
//                     errorDetails: error.response?.data,
//                     errorStatus: error.response?.status
//                 });
//             }
//         }

//         const successful = webhookResults.filter(result => result.status === 'success').length;
//         const failed = webhookResults.filter(result => result.status === 'failed').length;

//         return res.status(200).json({
//             success: true,
//             message: `Notifications processed for ${employeeData.length} employee(s)`,
//             summary: {
//                 total: employeeData.length,
//                 successful: successful,
//                 failed: failed
//             },
//             employees: employeeData,
//             webhookResults: webhookResults,
//             debug: {
//                 accessToken: process.env.WHATSAPP_ACCESS_TOKEN ? 'Present' : 'Missing',
//                 webhookUrl: webhookUrl
//             }
//         });

//     } catch (error) {
//         console.error('Error in triggerNotification:', error);
//         return res.status(500).json({
//             success: false,
//             message: 'Something went wrong in notification',
//             error: error.message,
//             stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
//         });
//     }
// };