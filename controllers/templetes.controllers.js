require("dotenv").config();
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

// async function sendTemplateMessage() {
//     const response = await axios({
//         url: 'https://graph.facebook.com/v20.0/396350056905733/messages',
//         method: 'post',
//         headers: {
//             'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
//             'Content-Type': 'application/json'
//         },
//         data: JSON.stringify({
//             messaging_product: 'whatsapp',
//             to: '918003509850',
//             type: 'template',
//             template:{
//                 name: 'discount',
//                 language: {
//                     code: 'en'
//                 }

//             }
//         })
//     })

//     console.log(response.data)
// }

// async function sendTextMessage() {
//     const response = await axios({
//         url: 'https://graph.facebook.com/v20.0/396350056905733/messages',
//         method: 'post',
//         headers: {
//             'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
//             'Content-Type': 'application/json'
//         },
//         data: JSON.stringify({
//             messaging_product: 'whatsapp',
//             to: '918003509850',
//             type: 'text',
//             text:{
//                 body: 'This is second text message for Rohan'
//             }
//         })
//     })

//     console.log(response.data)
// }

// sendTextMessage()
//const capt = "this is the caption"
  //const img = "https://images.pexels.com/photos/27893233/pexels-photo-27893233/free-photo-of-woman-in-shirt-photographing-with-digital-camera.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  
  
  exports.sendMediaMessage=async (req,res)=> {
    const {capt,img}=req.body;
    if(!capt || !img){
        return res.send({message:"required inputs are missing"})
    }
    const response = await axios({
        url: 'https://graph.facebook.com/v20.0/396350056905733/messages',
        method: 'post',
        headers: {
            'Authorization': `Bearer EAAPYUKxTtp4BO4ZBR2AH4PlLCOSJFWohsYQleH9BvApWs0D9a7x1Dhe6QVU821ssRU3fnpnGfdV2Py4ebOSFsrCEQGPF5GjVERuVnSkWrvhqlpysP3hqSJzZAQi93uiq7rhTUxlAu0Tr8QFuIHCw92w1TZBO3ZC1jUWjgWgZCU1dBhgV8jOxNUZCa61VagWoAwSPUxAcDzV6YVwmdtowhGspbeqnwq`,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            messaging_product: 'whatsapp',
            // to: '919560373759',
            to: '919957711685',

            type: 'image',
            image:{
                link: img,
                // id: '596824359338681',
                caption: capt
            }
        })
    })

    //console.log(response.data)
        return res.status(200).json(response.data)
  }
//sendMediaMessage()

// async function uploadImage() {
//     const data = new FormData()
//     data.append('messaging_product', 'whatsapp')
//     data.append('file', fs.createReadStream(process.cwd() + '/logo.png'), { contentType: 'image/png' })
//     data.append('type', 'image/png')

//     const response = await axios({
//         url: 'https://graph.facebook.com/v20.0/396350056905733/media',
//         method: 'post',
//         headers: {
//             'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`
//         },
//         data: data
//     })

//     console.log(response.data)
// }

// uploadImage()

// async function sendTemplateMessage() {
//   const response = await axios({
//     url: "https://graph.facebook.com/v20.0/396350056905733/messages",
//     method: "post",
//     headers: {
//       Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
//       "Content-Type": "application/json",
//     },
//     data: JSON.stringify({
//       messaging_product: "whatsapp",
//       to: "918003509850",
//       type: "template",
//       template: {
//         name: "rakhi_offer",
//         language: {
//           code: "en",
//         },
//         components: [
//           {
//             type: "header",
//             parameters: [
//               {
//                 type: "image",
//                 image: {
//                   link: "https://images.pexels.com/photos/247851/pexels-photo-247851.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
//                 },
//               },
//             ],
//           },

//           {
//             type: "body",
//             parameters: [
//               {
//                 type: "text",
//                 text: "50",
//               },
//             ],
//           } 
//         ],
//       },
//     }),
//   });

//   console.log(response.data);
// }

// sendTemplateMessage();
