// const convHook = require('../utils/whatsAppHooks');
// const recip = require('../models/recipModule');
// const surveyData = require('../models/surveyModule');

// exports.getWebhook = (req,res)=>{
//     const mode = req.query['hub.mode']
//     const challenge = req.query['hub.challenge']
//     const token = req.query['hub.verify_token']
  
//     if (mode && token === process.env.WEBHOOK_VERIFY_TOKEN) {
//       res.status(200).send(challenge)
//     } else {
//       res.sendStatus(403)
//     }
// }

// exports.conversationWebhook = async (req,res) =>{

//     const { entry } = req.body

//   if (!entry || entry.length === 0) {
//     return res.status(400).send('Invalid Request')
//   }

//   const changes = entry[0].changes

//   if (!changes || changes.length === 0) {
//     return res.status(400).send('Invalid Request')
//   }

//   const messages = changes[0].value.messages ? changes[0].value.messages[0] : null
  
//   console.log(messages)

//   if (messages) {
//     // Handle received messages
//     const userId = messages.from;
//     if (messages.type === 'text') {
//       if (messages.text.body.toLowerCase() === 'start') {
//         convHook.sendList(messages.from)
//       }
//       else{
//         convHook.replyMessage(messages.from, `Select the given option only or use 'start' to begain`, messages.id)
//       }
//     }

//     if (messages.type === 'interactive') {
//       if (messages.interactive.type === 'list_reply') {
//         convHook.sendMessage(messages.from, `You selected the option ${messages.interactive.list_reply.title}`)
//         convHook.sendReplyButtons_cleaned(messages.from)
//         if (messages.interactive.type === 'button_reply') {
//             convHook.sendMessage(messages.from, `You selected the button with ID ${messages.interactive.button_reply.id} - Title ${messages.interactive.button_reply.title}`)
//             convHook.sendReplyButtons_maintenance_indicator(messages.from)
//             if (messages.interactive.type === 'button_reply') {
//                 convHook.sendMessage(messages.from, `You selected the button with ID ${messages.interactive.button_reply.id} - Title ${messages.interactive.button_reply.title}`)
//                 convHook.sendReplyButtons_overheating(messages.from)
//               }
//           }
//         if (messages.interactive.type === 'button_reply') {
//             convHook.sendMessage(messages.from, `You selected the button with ID ${messages.interactive.button_reply.id} - Title ${messages.interactive.button_reply.title}`)
//             convHook.sendReplyButtons_sounds(messages.from)
//           }
//         if (messages.interactive.type === 'button_reply') {
//             convHook.sendMessage(messages.from, `You selected the button with ID ${messages.interactive.button_reply.id} - Title ${messages.interactive.button_reply.title}`)
//           }
//        }
//     }
   
    
//     console.log(JSON.stringify(messages, null, 2))
//   }
  
//   res.status(200).send('Webhook processed')
 
// }


// exports.statusWebhook = (req,res)=>{
//     const { entry } = req.body

//     if (!entry || entry.length === 0) {
//       return res.status(400).send('Invalid Request')
//     }
  
//     const changes = entry[0].changes
  
//     if (!changes || changes.length === 0) {
//       return res.status(400).send('Invalid Request')
//     }
  
//     const statuses = changes[0].value.statuses ? changes[0].value.statuses[0] : null
  
//     if (statuses) {
//       // Handle message status
//       console.log(`
//         MESSAGE STATUS UPDATE:
//         ID: ${statuses.id},
//         STATUS: ${statuses.status}
//       `)
//     }
// }


// exports.surveydata = async(req,res) =>{
//   try {
//         const recipDetail = await recip.find({})
//         const surveyDetail = await surveyData.find({})

//         res.status(200).send({
//           recipDetail,
//           surveyDetail
//         })
//       } catch (error) {
//         console.log(error) 
//       }
//     }


    
// // exports.mockdata = async (req,res) =>{
// //         try {
// //             const newUser = new restaurantModule({
// //               id: 'restaurant-3',
// //               name: 'Mountain Grill',
// //               location: '789 Summit Rd, Denver, CO',
// //               image: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
// //             })
// //             const result = await newUser.save();
// //             res.status(201).json({
// //                 success:true,
// //                 message:'Your recipient has been created',
// //                 result
// //             })
// //         } catch (error) {
// //             console.log(error)
// //         }
// // }