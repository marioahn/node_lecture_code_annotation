import { jest } from '@jest/globals';
import { PostsController } from '../../../src/controllers/posts.controller.js';

// posts.service.js 에서는 아래 5개의 Method만을 사용합니다.
const mockPostsService = {
  findAllPosts: jest.fn(),
  findPostById: jest.fn(),
  createPost: jest.fn(),
  updatePost: jest.fn(),
  deletePost: jest.fn(),
};

const mockRequest = { // service,repo엔 없던 (컨트롤러의)뉴페1
  body: jest.fn(),
};

const mockResponse = { // 뉴페2
  status: jest.fn(),
  json: jest.fn(),
};

const mockNext = jest.fn(); // 뉴페3

// postsController의 Service를 Mock Service로 의존성을 주입
const postsController = new PostsController(mockPostsService);

describe('Posts Controller Unit Test', () => {
  // 각 test가 실행되기 전에 실행된다
  beforeEach(() => {
    jest.resetAllMocks(); // 모든 Mock을 초기화

    // mockResponse.status의 경우 메서드 체이닝으로 인해 반환값이 Response(자신: this)로 설정되어야합니다.
      // 그니까, mockResponse는 status,json 두개를 키로 가지잖아.
      // mockResponse.status -> 이게 status관련 목함수이고, 한번 더 mockResponse를 써주면?(체이닝)
      // 그 다음 인자인 json관련 목함수가 실행되는 거임
      // 이것은 return res.status(200).json({ data: posts })의 모습과 똑같지?
    mockResponse.status.mockReturnValue(mockResponse);
  });

  // Test1: getPosts의 성공여부 - posts.controller.js의 함수를 보는거지(service가 아니라ㅇㅇ)
  test('getPosts Method by Success', async () => {
    const samplePosts = [
      {
        postId: 2,
        nickname: 'Nickname_2',
        title: 'Title_2',
        createdAt: new Date('07 October 2011 15:50 UTC'),
        updatedAt: new Date('07 October 2011 15:50 UTC'),
      },
      {
        postId: 1,
        nickname: 'Nickname_1',
        title: 'Title_1',
        createdAt: new Date('06 October 2011 15:50 UTC'),
        updatedAt: new Date('06 October 2011 15:50 UTC'),
      },
    ];
    mockPostsService.findAllPosts.mockReturnValue(samplePosts); // mock db에 담기
    // getPosts가보면 인자가 3개잖아. 그걸 위해 위에서도 mock인자들을 만들어줬고.
    await postsController.getPosts(mockRequest, mockResponse, mockNext); // 실제 실행

    expect(mockPostsService.findAllPosts).toHaveBeenCalledTimes(1);

    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledWith(200); // status200반환이지

    expect(mockResponse.json).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: samplePosts
    }); 

  });

  // Test2: createPost 성공 여부
  test('createPost Method by Success', async () => {
    const createPostRequestBodyParams = {
      nickname: 'Nickname_Success',
      password: 'Password_Success',
      title: 'Title_Success',
      content: 'Content_Success',
    };
    mockRequest.body = createPostRequestBodyParams; // mock의 body는 이렇게 쓰는거야. 형식 기억!

    // Service계층에 있는 createPost메서드를 실행했을 때, 반환되는 db의 데이터 형식
    const createPostReturnValue = {
      postId: 1,
      ...createPostRequestBodyParams, // 위에서 만든 mock데이터(bodyParams)를 넣으면 완성!(2단계네)
      createdAt: new Date().toString(), // 이것도 필수냐?
      updateAt: new Date().toString()
    }
    // PostsService.createPost Method의 Return 값을 createPostReturnValue 변수로 설정
      // = 실행결과를 mock데이터로 덮어씌우기 
    mockPostsService.createPost.mockReturnValue(createPostReturnValue); 
    
    // PostsController의 createPost Method를 실행
    const createPost =await postsController.createPost(mockRequest,mockResponse,mockNext);

    // 1.Service의 createPost
    expect(mockPostsService.createPost).toHaveBeenCalledTimes(1);
    expect(mockPostsService.createPost).toHaveBeenCalledWith(
      // posts.controller가보면, 4개의 바디데이터를 넣어서 createPost함수 호출한것이기에 그 인자를 넣는다
      // 그.리고. 위에서 우리는 mock의 body데이터를 mockRequest.body = '...Parmas'에 넣음
      createPostRequestBodyParams.nickname,
      createPostRequestBodyParams.password,
      createPostRequestBodyParams.title,
      createPostRequestBodyParams.content
    );

    // 2.Response status
    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledWith(201);

    // 3.Response json
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith({
      // data: createPost <- 이게 아니라 아래임
      // 다시 봐보자. posts.controller.js에서 json은,
        // 'await this.postsService.createPost(..'로 만들어진 것이 담김! 위에서 찾으셈 그거
      data: createPostReturnValue
    });
  });

  // Test3: createPost 에러가 제대로 출력되는지 여부
    // 여기의 에러처리는 service와 다르게 초 간단
  test('createPost Method by Invalid Params Error', async () => {
    mockRequest.body = { // 이 mock데이터는 title,content가 없기에 에러가 발생한다
      nickname: 'Nickname_InvalidParamsError',
      password: 'Password_InvalidParamsError',
    };

    // *실제로 실행을 시켜야 에러가 발생하든 말든 하지!
    await postsController.createPost(mockRequest,mockResponse,mockNext);
    // 에러발생: next(err) -> mockNext 여기서 드디어 쓰이네!
    expect(mockNext).toHaveBeenCalledWith(new Error('InvalidParamsError'))

  });

});