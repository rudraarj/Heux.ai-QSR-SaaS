const employeesModule = require("../../models/employeesModule")
const sectionModule = require("../../models/sectionModule")
const restaurantModule = require("../../models/restaurantModule")
const WhatsAppFlowService = require("../../services/whatsapp/flow")




const whatsAppFlowService = new WhatsAppFlowService(process.env.WHATSAPP_ACCESS_TOKEN_FOR_FLOW)



const sendTextMessageResponse = async (res, from, sender, timestamp, text) => {
    if (!from || !sender || !timestamp || !text) {
        console.log('missing fields')
        return res.status(500).send('Internal server error')
    }

    // check if correct employee ?  - can comment this is want to send flow to unkonwn employee
    const employee = await employeesModule.findOne({ whatsappNumber: from });
    if (!employee) {
        console.log("Unknown Employee tries to send text message.")
        return res.status(422)
    }


    // match text with section name - and if mached then send respective flow to this user.
    const extractedSectionName = text.split("start-")[1].split("-inspection")[0]
    if (!extractedSectionName) {
        console.log("Could not extract section name from message body.")
        return res.status(422)
    }

    const section = await sectionModule.findOne({ name: { $regex: `^${extractedSectionName}$`, $options: "i" } });
    if (!section) {
        console.log("No Section found.")
        return res.status(422)
    }

    if (!section.whatsappFlowId) {
        console.log("No Whatsapp flow if exist for this section.")
        return res.status(422)
    }

    if (section.whatsappFlowState !== 'Published') {
        console.log("Only Published flow can be sent.")
        return res.status(422)
    }

    const restaurant = await restaurantModule.findOne({id: section.restaurantId})
    if (!restaurant) {
        console.log("No restaurant found.")
        return res.status(422)
    }

    // send flow using api call
    const response = await whatsAppFlowService.sendFlow(section.whatsappFlowId, employee.whatsappNumber, section.name, restaurant.name, restaurant.location)
    if (!response.success) {
        console.log("flow was not sent because of : ", JSON.stringify(response.error, null, 2))
        return res.status(422)
    }

    return
}


const handleInteractiveFlowResponse = async (res, from, sender, timestamp, response_json) => {

}


module.exports = {
    sendTextMessageResponse,
    handleInteractiveFlowResponse
}