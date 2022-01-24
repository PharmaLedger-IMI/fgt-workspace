const axios = require('axios').default;

const put = async function(url, body) {
    try {
        return await axios.put(url, body);
    } catch (e) {
        return e.response.data;
    }
}

const get = async function(url, params) {
    const parsePathParams = (params) => {
        if (!params || params.length <= 0)
            return "";
        return '/' + params.join('/');
    }

    try {
        return await axios.get(url + parsePathParams(params));
    } catch (e) {
        return e.response.data;
    }
}

module.exports = {
    BASE_PATH: 'http://localhost:8081/traceability',
    put,
    get
}