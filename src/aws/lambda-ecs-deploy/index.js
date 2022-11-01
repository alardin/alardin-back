const { Client } = require("@notionhq/client")
const notion = new Client({ auth: process.env.NOTION_KEY })
const databaseId = process.env.NOTION_ECS_DB_ID;
const userId = process.env.USER_ID;

async function uploadToNotionDB(event, status, time) {
    console.log('[*] Update to Notion')
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
                        color: status === 'SUCCESS' ? 'green' : 'gray'
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
            },
            Mention: status == 'SUCCESS' ? {
                type: 'rich_text',
                rich_text: [
                    {
                        mention: {
                            user: {
                                id: userId,
                                person: {
                                    email: process.env.EMAIL
                                }
                            }
                        }
                    }
                ]
            } : {}
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
            await uploadToNotionDB(event['detail']['eventName'], event['detail']['lastStatus'], time)
            break;
        case 'ECS Service Action':
            if (event['detail']['serviceName'] == 'SERVICE_STEADY_STATE') {
                await uploadToNotionDB(event['detail']['eventName'], 'SUCCESS', time);
                break
            }
        default:
            break;
    }

    console.log(`[*] event here`)
    console.log(event);

}  