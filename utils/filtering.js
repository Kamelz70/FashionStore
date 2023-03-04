exports.filterObject = (Obj, ...fields) => {
    const filteredObj = {};
    Object.keys(Obj).forEach((el) => {
        if (fields.includes(el)) {
            filteredObj[el] = Obj[el];
        }
    });
    return filteredObj;
};
