let stringFormat = {
  format: function (str: string, arr: Array<string>) {
    let a =
      typeof arguments[1] === "object"
        ? arr
        : Array.prototype.slice.call(arguments).slice(1);
    return str.replace(/\{{([0-9]+)\}}/g, function (_, index) {
      return a[index];
    });
  }
};

export default stringFormat;
