const employeesModule = require("../models/employeesModule")
const inspectionsModule = require("../models/inspectionsModule")
const restaurantModule = require("../models/restaurantModule")
const sectionModule = require("../models/sectionModule")

async function fetchAndSendData(ws) {
    try {
    //   const inspection = await inspectionsModule.find({});
    //   const employees = await employeesModule.find({});
    //   const restaurant = await restaurantModule.find({});
    //   const section = await sectionModule.find({});
  
      ws.send(
        JSON.stringify({
          type: 'inspection_data',
          inspection,
          employees,
          restaurant,
          section,
        })
      );
    } catch (error) {
      console.error(error);
      ws.send(JSON.stringify({ type: 'error', message: 'Failed to fetch data' }));
    }
  }
  

function handleConnection(ws, req) {
    console.log('🟢 Client connected');
  
    // Send data immediately on connect
    fetchAndSendData(ws);
  
    ws.on('message', (msg) => {
      const parsed = JSON.parse(msg);
      if (parsed.type === 'get_inspection_data') {
        fetchAndSendData(ws);
      }
    });
  
    ws.on('close', () => console.log('🔴 Client disconnected'));
  }
  
//   module.exports = { handleConnection };