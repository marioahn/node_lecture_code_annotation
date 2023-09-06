import winston from 'winston'; // winston라이브러리 가져오기

const logger = winston.createLogger({
  level: 'info', // 로그 레벨을 'info'로 설정한다
  format: winston.format.json(), // 로그 포맷을 JSON 형식으로 설정한다
  transports: [ // (transports: log를 어떤 방식으로 출력할 것인지)
    new winston.transports.Console(), // 로그를 콘솔에 출력한다
  ],
});

export default function (req, res, next) {
  // 클라이언트의 요청이 시작된 시간을 기록한다
  const start = new Date().getTime();

  // 응답이 완료되면 로그를 기록한다
  res.on('finish', () => {
    const duration = new Date().getTime() - start;
    logger.info( // 위에서 만든 logger를 여기서 씀
      `Method: ${req.method}, URL: ${req.url}, Status: ${res.statusCode}, Duration: ${duration}ms`,
    ); // {"level":"info","message":"Method: POST, URL: /sign-in, Status: 200, Duration: 226ms"}

    // info레벨말고도, error등의 레벨이 있다. 아래처럼 써주기 가능!
    // logger.warn(`Method: ${req.method}, URL: ${req.url}, Status: ${res.statusCode}, Duration: ${duration}ms`,);
    // logger.error(`Method: ${req.method}, URL: ${req.url}, Status: ${res.statusCode}, Duration: ${duration}ms`,);
  });

  next();
}