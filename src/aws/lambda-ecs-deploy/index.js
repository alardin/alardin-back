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
            Tags: status === "SUCCESS" ? {
                type: 'multi_select',
                multi_select: [
                    {
                        name: status === status,
                        color: status === 'green'
                    }
                ]
            } : {},
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

    // if (subject.indexOf('CodeDeploy notification') == -1) {
    //     const status = subject.indexOf("SUCCEEDED")  == -1 ? subject : "SUCCESS";
    //     let spentTime = '';
    //     if (status === "SUCCESS") {
    //         const message = snsReceived.Message;
    //         const lifecycleEvents = JSON.parse(JSON.parse(message).lifecycleEvents);
    //         const appStartEvent = lifecycleEvents.filter(e => e.LifecycleEvent == 'ApplicationStart');
    //         const totalSeconds = (new Date(appStartEvent[0].EndTime) - new Date(appStartEvent[0].StartTime)) / 1000;
    //         const spentMinutes = Math.floor(totalSeconds / 60);
    //         const spentSeconds = totalSeconds % 60;
    //         spentTime = `${spentMinutes < 10 ? '0'+spentMinutes : spentMinutes}:${spentSeconds < 10 ? '0'+spentSeconds : spentSeconds}`
    //     }
    //     await uploadToNotionDB(new Date(new Date(timestamp).getTime() + (1000 * 60 * 60 * 9)), status, spentTime);
    // }
}  