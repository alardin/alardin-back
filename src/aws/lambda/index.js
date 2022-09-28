const { Client } = require("./node_modules/@notionhq/client")
const notion = new Client({ auth: process.env.NOTION_KEY })
const databaseId = process.env.NOTION_DATABASE_ID;
const userId = process.env.USER_ID;

async function uploadToNotionDB(timestamp, status, spentTime) {
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
                        content: `deploy_${months}/${date}/${years} ${hours}:${minutes}`
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
            Subject: {
                type: 'rich_text',
                rich_text: [
                    {
                        text: {
                            content: status
                        },
                    }
                ]
            },
            Spent_time: {
                type: 'rich_text',
                rich_text: [
                    {
                        text: {
                            content: spentTime
                        }
                    }
                ]
            },
            Mention: {
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
            }
        
        }
    });
}

exports.handler = async (event, context, callback) => {
    const snsReceived = event.Records[0].Sns;
    const timestamp = snsReceived.Timestamp;
    const subject = snsReceived.Subject;

    if (subject.indexOf('CodeDeploy notification') == -1) {
        const status = subject.indexOf("SUCCEEDED")  == -1 ? subject : "SUCCESS";
        let spentTime = '';
        if (status === "SUCCESS") {
            const message = snsReceived.Message;
            const lifecycleEvents = JSON.parse(JSON.parse(message).lifecycleEvents);
            const appStartEvent = lifecycleEvents.filter(e => e.LifecycleEvent == 'ApplicationStart');
            const totalSeconds = (new Date(appStartEvent[0].EndTime) - new Date(appStartEvent[0].StartTime)) / 1000;
            const spentMinutes = Math.floor(totalSeconds / 60);
            const spentSeconds = totalSeconds % 60;
            spentTime = `${spentMinutes < 10 ? '0'+spentMinutes : spentMinutes}:${spentSeconds < 10 ? '0'+spentSeconds : spentSeconds}`
        }
        await uploadToNotionDB(new Date(new Date(timestamp).getTime() + (1000 * 60 * 60 * 9)), status, spentTime);
    }
}  