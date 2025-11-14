// services/whatsappFlowService.js
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');


const WHATSAPP_API_VERSION = 'v18.0';
const GRAPH_API_URL = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`;

class WhatsAppFlowService {
  constructor(accessToken) {
    this.accessToken = accessToken || process.env.WHATSAPP_ACCESS_TOKEN_FOR_FLOW;
    this.headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  // Create a new flow
  async createFlow(wabaId, { name, categories = ['SURVEY'], flowJson, endpointUri = process.env.WHATSAPP_FLOW_ENDPOINT_URI, publish = true }) {
    try {
      const response = await axios.post(
        `${GRAPH_API_URL}/${wabaId}/flows`,
        {
          name,
          categories,
          ...(flowJson && { flow_json: flowJson }),
          ...(publish && { publish: publish }),
          ...(endpointUri && { endpoint_uri: endpointUri }),
        },
        { headers: this.headers }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, status: error.response.status, error: error.response.data.error };
    }
  }

  // Update flow metadata
  async updateFlowMetadata(flowId, { name, categories = ['SURVEY'], endpointUri = process.env.WHATSAPP_FLOW_ENDPOINT_URI }) {
    try {
      const response = await axios.post(
        `${GRAPH_API_URL}/${flowId}`,
        {
          name,
          categories,
          ...(endpointUri && { endpoint_uri: endpointUri }),
        },
        { headers: this.headers }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, status: error.response.status, error: error.response.data.error };
    }
  }

  // Update flow JSON with file
  async updateFlowJson(flowId, filePath) {
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));
      formData.append('name', 'flow.json');
      formData.append('asset_type', 'FLOW_JSON');

      const response = await axios.post(
        `${GRAPH_API_URL}/${flowId}/assets`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            ...formData.getHeaders()
          }
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, status: error.response.status, error: error.response.data.error };
    }
  }

  // Update flow JSON with JSON object
  async updateFlowJsonDirect(flowId, flowJson) {
    const tempFilePath = `${path.join(__dirname, '..', '..')}/flow-json/temp-${flowId}_${Date.now()}_${Math.floor(10000000 + Math.random() * 90000000)}.json`;

    try {
      // Create temp file
      fs.writeFileSync(tempFilePath, JSON.stringify(flowJson));

      const result = await this.updateFlowJson(flowId, tempFilePath);

      // Clean up
      fs.unlinkSync(tempFilePath);

      return result;
    } catch (error) {
      // Clean up on error
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      return { success: false, status: 500, error: 'Error while creating temp file.' };
    }
  }

  // publish a flow
  async publishFlow(flowId) {
    try {
      const response = await axios.post(
        `${GRAPH_API_URL}/${flowId}/publish`,
        {},
        { headers: this.headers }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, status: error.response.status, error: error.response.data.error };
    }
  }

  // Deprecate flow
  async deprecateFlow(flowId) {
    try {
      const response = await axios.post(
        `${GRAPH_API_URL}/${flowId}/deprecate`,
        {},
        { headers: this.headers }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, status: error.response.status, error: error.response.data.error };
    }
  }

  // Delete flow
  async deleteFlow(flowId) {
    try {
      const response = await axios.delete(
        `${GRAPH_API_URL}/${flowId}`,
        { headers: this.headers }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, status: error.response.status, error: error.response.data.error };
    }
  }

  // Get flow details
  async getFlow(flowId) {
    try {
      const response = await axios.get(
        `${GRAPH_API_URL}/${flowId}?fields=id,name,categories,preview,status,validation_errors,json_version,data_api_version,data_channel_uri,health_status,whatsapp_business_account,application`,
        { headers: this.headers }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, status: error.response.status, error: error.response.data.error };
    }
  }

  // List all flows
  async listFlows(wabaId) {
    try {
      const response = await axios.get(
        `${GRAPH_API_URL}/${wabaId}/flows`,
        { headers: this.headers }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, status: error.response.status, error: error.response.data.error };
    }
  }

  async sendFlow(flowId, to, section, restaurantName, restaurantLocation, options = {}) {
    try {
      const payload = {
        messaging_product: "whatsapp",
        to: to,
        recipient_type: "individual",
        type: "interactive",
        interactive: {
          type: "flow",
          header: {
            type: "text",
            text: options.headerText || `${restaurantName} ${restaurantLocation} : Start ${section} Inspection`
          },
          body: {
            text: options.bodyText || `Hey,\n🚨 ${restaurantName} ${restaurantLocation}: Please start the ${section} inspection by clicking the button below. Make sure all SOPs are followed and quality standards are maintained across all units.\n~HeyOpey.ai`
          },
          footer: {
            text: options.footerText || "Powered by HeyOpey.ai"
          },
          action: {
            name: "flow",
            parameters: {
              flow_message_version: "3",
              flow_action: options.flowAction || "navigate",
              flow_token: options.flowToken || `FLOW_TOKEN_${Date.now()}`,
              flow_id: flowId,
              flow_cta: options.flowCta || "Inspect Now!",
              flow_action_payload: {
                screen: options.screen || "SCREEN_ONE",
                data: options.data || { section: section }
              }
            }
          }
        }
      };

      const response = await axios.post(
        `${GRAPH_API_URL}/${process.env.PHONE_NUMBER_ID}/messages`,
        payload,
        { headers: this.headers }
      );

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        status: error.response?.status,
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Error handler
  handleError(error) {
    if (error.response) {
      return {
        success: false,
        status: error.response.status,
        error: error.response.data
      };
    }
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = WhatsAppFlowService;