import jwt from 'jsonwebtoken';

const token = jwt.sign({ myPayloadData: 1234 }, 'mysecretkey');
console.log(token); 

// jwt payload 복호화
const decodedValue = jwt.decode(token);
console.log(decodedValue);

// jwt 변조 검증
const decodedValueByVerify = jwt.verify(token, 'mysecretkey');
const decodedValueByVerify2 = jwt.verify(token, 'wrongkey'); // 에러 뜸
console.log(decodedValueByVerify);
console.log(decodedValueByVerify2); // JsonWebTokenError: invalid signature