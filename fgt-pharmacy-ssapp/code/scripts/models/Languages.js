const languages = [
    {"name": "English", "code": "en"},
    {"name": "German", "code": "de"}
];

export default {
    getList() {
        return languages;
    },
    getListAsVM() {
        let result = [];
        languages.forEach(language => {
            result.push({label: language.name, value: language.code});
        });

        return result;
    },
    getLanguage(code) {
        return languages.find(language => language.code === code).name;
    }
}