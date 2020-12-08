const stringFormat = {
  format: function (str: string, ...arr: Array<string>) {
    // const a =
    //   typeof arr === "object"
    //     ? arr
    //     : Array.prototype.slice.call(arguments).slice(1);
    return str.replace(/\{{([0-9]+)\}}/g, function (_, index) {
      return arr[index];
    });
  }
};

export default stringFormat;
