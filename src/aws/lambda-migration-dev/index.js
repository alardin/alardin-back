const { Client } = require("@notionhq/client")
const notion = new Client({ auth: process.env.NOTION_KEY })
const databaseId = process.env.NOTION_DEV_MIGRATION_DB_ID;
const userId = process.env.USER_ID;

async function uploadToNotionDB(timestamp, status) {
    console.log('[*] Update to Notion');
    let years = timestamp.getFullYear();
    let months = timestamp.getMonth()+1;
    let date = timestamp.getDate();
    let hours = timestamp.getHours();
    let minutes = timestamp.getMinutes();
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
                        content: `migration_${months}/${date}/${years} ${hours}:${minutes}`
                    }
                }]
            },
            Tags: {
                type: 'multi_select',
                multi_select: [
                    {
                        name: status === "SUCCESS" ? status : "FAIL",
                        color: status === "SUCCESS" ? 'green' : 'red'
                    }
                ]
            },
            Mention: {
                type: 'rich_text',
                rich_text: [
                    status === "SUCCESS" ? 
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
    const timestamp = snsReceived.Timestamp;
    const subject = snsReceived.Subject;
    console.log('[*]', subject)
    const status = subject.indexOf("INPROGRESS")  == -1 ? subject : "SUCCESS";
    await uploadToNotionDB(new Date(new Date(timestamp).getTime() + (1000 * 60 * 60 * 9)), status);
    
}  