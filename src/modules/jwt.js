import JWT from 'jsonwebtoken'
import config from '../config.js'

function generateToken (data) {
      return JWT.sign(data , config.JWT_SECRET)
}

function verifyToken (data) {
	try {
      return JWT.verify(data , config.JWT_SECRET)
		
	} catch(e) {
      return false
	}
}

export default{
generateToken , verifyToken
}