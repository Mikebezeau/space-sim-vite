export const getObjectSize = (obj: object): number => {
  let bytes = 0;

  function sizeOf(obj: any): number {
    if (obj !== null && obj !== undefined) {
      switch (typeof obj) {
        case "number":
          bytes += 8;
          break;
        case "string":
          bytes += obj.length * 2;
          break;
        case "boolean":
          bytes += 4;
          break;
        case "object":
          const objClass = Object.prototype.toString.call(obj).slice(8, -1);
          if (objClass === "Object" || objClass === "Array") {
            for (const key in obj) {
              if (obj.hasOwnProperty(key)) {
                sizeOf(obj[key]);
              }
            }
          } else bytes += obj.toString().length * 2;
          break;
      }
    }
    return bytes;
  }

  return sizeOf(obj);
};
