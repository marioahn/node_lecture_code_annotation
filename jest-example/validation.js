export const isEmail = (value) => {

  const email = (value || ''); 

  const [localPart, domainPart, ...etc] = email.split('@');
  // 만약, @가 2개 이상 들어가 있으면, etc값이 나오게 됨

  // 1.입력한 이메일 주소에는 "@"문자가 1개만 있어야 한다
    // -> !local || !domain은 -> local && domain과 같지. 즉, 둘 다 존재해야!
  if (!localPart || !domainPart || etc.length) {
    return false;
  } 
  // 2. 입력한 이메일 주소에 공백(스페이스)가 존재하면 안된다
  else if (email.includes(' ')) {
    return false;
  }
  // 3. 입력한 이메일 주소 맨 앞에 하이픈(-)이 있으면 안된다
  else if (email[0] === '-') {
    return false;
  };

  // 4. -> 영문 대소문자 ok니까, 먼저 소문자화ㄱㄱ
  for (const word of localPart.toLowerCase().split("")) {
    if (!["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","0","1","2","3","4","5","6","7","8","9","-","+","_"].includes(word)) {
      return false;
    }
  };

  for (const word of domainPart.toLowerCase().split("")) {
    if (!["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","0","1","2","3","4","5","6","7","8","9","-", "."].includes(word)) {
      return false;
    }
  };

  return true;
};