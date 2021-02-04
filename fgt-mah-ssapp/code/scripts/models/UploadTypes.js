const types = [
    {name: "Leaflet", code: "leaflet"},
    {name: "SMPC", code: "smpc"}
];

export default {
    getList() {
        return types;
    },
    getListAsVM() {
        let result = [];
        types.forEach(type => {
            result.push({label: type.name, value: type.code});
        });

        return result;
    },
    getLanguage(code) {
        return types.find(language => language.code === code).name;
    }
}