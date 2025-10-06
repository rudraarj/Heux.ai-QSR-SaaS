// const convHook = require('../utils/whatsAppHooks');

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
