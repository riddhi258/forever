import jwt from 'jsonwebtoken';

const authUser = (req, res, next) => {
     const  {token} = req.headers;
     if(!token) {
         return res.json({success:false ,message: 'Not authorized please login again'});
     }
     try {
        debugger
         const token_decode = jwt.verify(token, process.env.JWT_SECRET);
         req.body.userId = token_decode.id;
         next();
     } catch (error) {
         console.error(error);
         return res.json({success:false, message:error.message});
     }
}

export default authUser;
// This middleware checks for a JWT token in the request headers.