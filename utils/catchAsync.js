//takes in a function, returns a funtion which calls the input function with the catch
module.exports = (fn) => (req, res, next) => {
    fn(req, res, next).catch(next);
};
