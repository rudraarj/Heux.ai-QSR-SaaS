const axios = require("axios");

exports.sendMessage = async (to, body)=>{
await axios({
      url: 'https://graph.facebook.com/v22.0/547704035102121/messages',
      method: 'post',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: {
          body
        }
      })
    })
}

exports.replyMessage = async (to, body, messageId)=>{
    await axios({
      url: 'https://graph.facebook.com/v22.0/547704035102121/messages',
      method: 'post',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: {
          body
        },
        context: {
          message_id: messageId
        }
      })
    })
}

exports.sendList = async (to)=>{
    await axios({
      url: 'https://graph.facebook.com/v22.0/547704035102121/messages',
      method: 'post',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'interactive',
        interactive: {
          type: 'list',
          header: {
            type: 'text',
            text: 'Appliances'
          },
          body: {
            text: 'Select the machine'
          },
          footer: {
            text: 'This is the message footer'
          },
          action: {
            button: 'Tap for the options',
            sections: [
              {
                title: 'First Section',
                rows: [
                  {
                    id: 'first_option',
                    title: 'Espresso Machine',
                  },
                  {
                    id: 'second_option',
                    title: 'Freezer',
                  },
                  {
                    id: 'third_option',
                    title: 'Iced Cap Machine',
                  },
                  {
                    id: 'forth_option',
                    title: 'Fryer',
                  }
                ]
              },
            //   {
            //     title: 'Second Section',
            //     rows: [
            //       {
            //         id: 'third_option',
            //         title: 'Third option'
            //       }
            //     ]
            //   }
            ]
          }
        }
      })
    })
}

exports.sendReplyButtons_cleaned = async (to)=>{
    await axios({
      url: 'https://graph.facebook.com/v22.0/547704035102121/messages',
      method: 'post',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'interactive',
        interactive: {
          type: 'button',
          header: {
            type: 'text',
            text: 'Is it cleaned as per the schedule ?'
          },
          body: {
            text: 'This is a interactive reply buttons message'
          },
          footer: {
            text: 'This is the message footer'
          },
          action: {
            buttons: [
              {
                type: 'reply',
                reply: {
                  id: 'first_button',
                  title: 'YES'
                }
              },
              {
                type: 'reply',
                reply: {
                  id: 'second_button',
                  title: 'NO'
                }
              },
            ]
          }
        }
      })
    })
}
exports.sendReplyButtons_maintenance_indicator = async (to)=>{
    await axios({
      url: 'https://graph.facebook.com/v22.0/547704035102121/messages',
      method: 'post',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'interactive',
        interactive: {
          type: 'button',
          header: {
            type: 'text',
            text: 'Is it showing maintenance indicator ?'
          },
          body: {
            text: 'This is a interactive reply buttons message'
          },
          footer: {
            text: 'This is the message footer'
          },
          action: {
            buttons: [
              {
                type: 'reply',
                reply: {
                  id: 'first_button',
                  title: 'YES'
                }
              },
              {
                type: 'reply',
                reply: {
                  id: 'second_button',
                  title: 'NO'
                }
              },
            ]
          }
        }
      })
    })
}
exports.sendReplyButtons_sounds = async (to)=>{
    await axios({
      url: 'https://graph.facebook.com/v22.0/547704035102121/messages',
      method: 'post',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'interactive',
        interactive: {
          type: 'button',
          header: {
            type: 'text',
            text: 'Is it making any sounds ?'
          },
          body: {
            text: 'This is a interactive reply buttons message'
          },
          footer: {
            text: 'This is the message footer'
          },
          action: {
            buttons: [
              {
                type: 'reply',
                reply: {
                  id: 'first_button',
                  title: 'YES'
                }
              },
              {
                type: 'reply',
                reply: {
                  id: 'second_button',
                  title: 'NO'
                }
              },
            ]
          }
        }
      })
    })
}
exports.sendReplyButtons_overheating = async (to)=>{
    await axios({
      url: 'https://graph.facebook.com/v22.0/547704035102121/messages',
      method: 'post',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'interactive',
        interactive: {
          type: 'button',
          header: {
            type: 'text',
            text: 'Is it overheating ?'
          },
          body: {
            text: 'This is a interactive reply buttons message'
          },
          footer: {
            text: 'This is the message footer'
          },
          action: {
            buttons: [
              {
                type: 'reply',
                reply: {
                  id: 'first_button',
                  title: 'YES'
                }
              },
              {
                type: 'reply',
                reply: {
                  id: 'second_button',
                  title: 'NO'
                }
              },
            ]
          }
        }
      })
    })
}

exports.flow = async(to) =>{
    await axios({
        method: "POST",
        url: `https://graph.facebook.com/v22.0/547704035102121/messages`,
        headers: {
            'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        },
        data:{
            messaging_product: 'whatsapp',
            to,
            type: "interactive",
            interactive: {
                type: "flow",
                header: {
                    type: "text",
                    text: "Hello there 👋",
                },
                body: {
                    text: "Ready to transform your space? Schedule a personalized consultation with our expert team!",
                },
                footer: {
                    text: "Click the button below to proceed",
                },
                action: {
                    name: "flow",
                    parameters: {
                        flow_id: 1377611066706479,
                        flow_message_version: "3",
                        // replace flow_token with a unique identifier for this flow message to track it in your endpoint & webhook
                        flow_token: "my-token",
                        flow_cta: "Book an appointment",
                        flow_action: "navigate"
                    },
                },
            },
       },
    });
}
