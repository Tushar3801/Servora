const roleMiddleware = (requiredRole) => {
    return (req, res, next) => {
        if(req.user.role === requiredRole){
            next();
        }else{
        return res.status(403).json({
        message: "not a specified role"
        });
    }
    };
};
module.exports = roleMiddleware;