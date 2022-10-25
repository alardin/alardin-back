const { Client } = require("@notionhq/client")
const notion = new Client({ auth: process.env.NOTION_KEY })
const userId = process.env.USER_ID;
let databaseId;
async function updateNotion(type, message) {
    if (type == 'GAME') {
        databaseId = process.env.NOTION_GAME_DB_ID;
    } else if (type == 'SERVER') {
        databaseId = process.env.NOTION_SERVER_DB_ID;
    }
    const now = new Date(Date.now() + ( 1000 * 60 * 60 * 9 ));
    let years = now.getFullYear();
    let months = now.getMonth()+1;
    let date = now.getDate();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    months = months <= 9 ? `0${months}` : months;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    hours = hours < 10 ?  `0${hours}` : hours;
    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Name: {
          type: 'title',
          title: [{
              type: 'text',
              text: {
                  content: `check_${months}/${date}/${years} ${hours}:${minutes}`
              }
          }]
        },
        Tags: {
            type: 'multi_select',
            multi_select: [
                {
                    name: message,
                    color: message === "ALIVE" ? 'green' : 'red'
                }
            ]
        },
        Message: {
          type: 'rich_text',
          rich_text: [
              {
                  text: {
                      content: message
                  },
              }
          ]
        },
        Mention: {
          type: 'rich_text',
          rich_text: [
              message === "ALIVE" ? 
              {
                text: {
                  content: ''
                }
              } : {
                  mention: {
                      user: {
                          id: process.env.NOTION_USER_ID,
                          person: {
                              email: process.env.EMAIL
                          }
                      }
                  }
              }
          ]
        }
      }
    });
}

exports.handler = async (event, context, callback) => {
    const snsReceived = event.Records[0].Sns;
    const [type, message] = snsReceived.Message.split(' ');
    console.log('type: ', type, 'message:', message)
    await updateNotion(type, message);
}  