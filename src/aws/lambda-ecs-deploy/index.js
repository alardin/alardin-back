const { Client } = require("@notionhq/client")
const notion = new Client({ auth: process.env.NOTION_KEY })
const databaseId = process.env.NOTION_ECS_DB_ID;
const userId = process.env.USER_ID;

async function uploadToNotionDB(event, status, time, color='gray') {
    console.log('[*] Update to Notion')
    console.log(status)
    await notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
            Name: {
                type: 'title',
                title: [{
                    type: 'text',
                    text: {
                        content: `ecs_${time}`
                    }
                }]
            },
            Tags: {
                type: 'multi_select',
                multi_select: [
                    {
                        name: status,
                        color: color
                    }
                ]
            },
            Message: {
                type: 'rich_text',
                rich_text: [
                    {
                        text: {
                            content: event
                        },
                    }
                ]
            }
        }
    });
}

exports.handler = async (event, context, callback) => {
    if (event['source'] != 'aws.ecs') {
        return null;
    }
    const time = event['time'];
    switch(event['detail-type']) {
        case 'ECS Deployment State Change':
            if (event['detail']['eventType'] === 'ERROR') {
                await uploadToNotionDB(event['detail']['reason'], event['detail']['eventName'], time, 'red')
            } else if (event['detail']['eventName'] === 'SERVICE_DEPLOYMENT_COMPLETED') {
                await uploadToNotionDB(event['detail']['eventName'], 'COMPLETED', time, 'blue')
            }
            break;
        case 'ECS Service Action':
            if (event['detail']['eventName'] == 'SERVICE_STEADY_STATE') {
                await uploadToNotionDB(event['detail']['eventName'], 'SUCCESS', time, 'green');
            } else if (event['detail']['evqentType'] === 'ERROR') {
                await uploadToNotionDB(event['detail']['reason'], 'ERROR', time, 'red');
            }
            break;
        default:
            break;
    }

    console.log(`[*] event here`)
    console.log(event);

}  