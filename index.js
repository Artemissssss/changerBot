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
        {command:"/image", description:"Надіслати зображення"},
        {command:"/getimage", description:"Подивитися зображення"},
    ])

    bot.on("message", async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;
        if(msg?.caption?.includes("/image")){
            const newIdH = await main()
            run({idH:newIdH,
            photo:msg.photo[0].file_id,
            del:msg.caption.split(" ")[1],
            time:msg.caption.split(" ")[2]})  
            bot.sendMessage(chatId, `Ви сторили зображення по айді ${newIdH}`)
        } else if(text?.includes("/getimage")){
            const htOb = await getRun(text.split(" ")[1]);
            console.log(htOb)
            if(htOb?.del === "@"+msg.from.username){
                if(htOb.time === "0"){
                    await bot.sendPhoto(chatId,htOb.photo,{caption : "Необмежене зображення для тебе"} );
                    await deleteRun(htOb.idH)
                }else{
                    await bot.sendPhoto(chatId,htOb.photo,{caption : `Зображення для тебе на ${htOb.time} секунд`} );
                    await deleteRun(htOb.idH)
                    setTimeout(() => {
                        const msgId = msg.message_id+1;
                        bot.deleteMessage(chatId,msgId);
                    }, parseInt(htOb.time)*1000);
                }
            }
        } else if(text?.includes("/help")){
            bot.sendMessage(chatId, `Привіт \nЩоб стоврити хтивку напишіть:\n "/image @юзернейм-отримувача час-у-секуднах(якщо необмежений час то 0)" \n Для отримання хтивки напиить:\n "/getimage айді-хтивки"`)
        }
    })
}
start()
