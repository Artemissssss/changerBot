const TelegramApi = require('node-telegram-bot-api')
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://artem-vainshtein:ESxefzHpNKiSf8TW@cluster0.u0d73wi.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const token = "6341244254:AAFu3wSDqa67wEdrkCKincjFo4ugxHeZ5yg"

const bot = new TelegramApi(token, {
    polling: true
})
async function main() {
    const { nanoid } = await import('nanoid');
    const randomId = nanoid();
    return randomId;
}
async function run(data) {
    try {
        await client.connect();
        const database = client.db('changer-bot');
        const collection = database.collection('changer-list');
        const doc = data;
        const result = await collection.insertOne(doc);
    } finally {
        await client.close();
    }
}

async function getRun(data) {
    try {
        await client.connect();
        const database = client.db('changer-bot');
        const collection = database.collection('changer-list');
        const query = { idH: data };
        const foundDoc = await collection.findOne(query);
        return foundDoc;
    } finally {
        await client.close();
    }
}

async function deleteRun(data) {
    try {
        await client.connect();
        const database = client.db('changer-bot');
        const collection = database.collection('changer-list');
        const query = { idH: data };
        const foundDoc = await collection.deleteOne(query);
    } finally {
        await client.close();
    }
}

const start = () => {
    bot.setMyCommands([
        {command:"/help", description:"Туторіал"},
        {command:"/htyvka", description:"Надіслати хтивку"},
        {command:"/gethtyvka", description:"Подивитися хтивку"},
    ])

    bot.on("message", async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;
        if(msg?.caption?.includes("/htyvka")){
            const newIdH = await main()
            run({idH:newIdH,
            photo:msg.photo[0].file_id,
            del:msg.caption.split(" ")[1],
            time:msg.caption.split(" ")[2]})  
            bot.sendMessage(chatId, `Ви сторили хтивку по айді ${newIdH}`)
        } else if(text?.includes("/gethtyvka")){
            const htOb = await getRun(text.split(" ")[1]);
            console.log(htOb)
            if(htOb?.del === "@"+msg.from.username){
                if(htOb.time === "0"){
                    await bot.sendPhoto(chatId,htOb.photo,{caption : "Необмежена хтивка для тебе(? вічний туалет)"} );
                    await deleteRun(htOb.idH)
                }else{
                    await bot.sendPhoto(chatId,htOb.photo,{caption : `Хтивка для тебе на ${htOb.time} секунд(попроси ще раз)`} );
                    await deleteRun(htOb.idH)
                    setTimeout(() => {
                        const msgId = msg.message_id+1;
                        bot.deleteMessage(chatId,msgId);
                    }, parseInt(htOb.time)*1000);
                }
            }
        } else if(text?.includes("/help")){
            bot.sendMessage(chatId, `Привіт \nЩоб стоврити хтивку напишіть:\n "/htyvka @юзернейм-отримувача час-у-секуднах(якщо необмежений час то 0)" \n Для отримання хтивки напиить:\n "/gethtyvka айді-хтивки"`)
        }
    })
}
start()
