

export function stringToBoolean(str){
  if(typeof str === "boolean"){
    return str;
  }
  if (typeof str === "string") {
    switch (str.toLowerCase().trim()) {
      case "true":
      case "1":
        return true;
      case "false":
      case "0":
      case null:
        return false;
      default:
        return Boolean(str);
    }
  }

  return Boolean(str);
}
