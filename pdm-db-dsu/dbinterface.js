class Database {
    get(key);

    set(key, value);

    list(key);
}

class Sender{
    sendMessage(api, key);
}

module.exports = {
    Database,
    Sender
}