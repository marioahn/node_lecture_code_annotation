export default function (err, req, res, next) { // 단순 - 딱 2가지 로직
  // 1)에러를 출력한다
  console.error(err);
  // 2)클라이언트에게 에러 메시지를 전달한다
  res.status(500).json({ errorMessage: '서버 내부 에러가 발생했습니다.' });
}