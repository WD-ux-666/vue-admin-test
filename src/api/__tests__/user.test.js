import { describe,test,expect,vi } from "vitest";

vi.mock('../request.js', () => ({
    default:vi.fn()
}))
import { register,login,getUserList,delUser } from "../user";
import request from '../request'

describe('注册接口封装',() => {
    test('register 应以 POST 调用 /register，并原样透传 data',async () => {
        request.mockResolvedValue({code:200,msg:'注册成功'})

        const payload = {username:'test001',password:'123456'}
        const res = await register(payload)

        expect(request).toHaveBeenCalledWith({
            url:'/register',
            method:'post',
            data:payload
        })
        expect(res).toEqual({code:200,msg:'注册成功'})
    })

    test('login 应以 POST 调用 login，并透传 data',async () => {
        request.mockResolvedValue({code:200,msg:'登录成功'})
        const payload = {username:'admin',password:'123456'}
        const res = await login(payload)
        expect(request).toHaveBeenCalledWith({
            url:'login',
            method:'post',
            data:payload
        })
        expect(res).toEqual({code:200,msg:'登录成功'})
    })
    test('getUserList 应以 GET 调用 /user/list，分页参数走 params',async() =>{
        request.mockResolvedValue({code:200,data :[]})
        await getUserList(2, 5)
        expect(request).toHaveBeenCalledWith({
            url:'/user/list',
            method:'get',
            params:{page:2,pageSize: 5}
        })
    })
    test ( 'delUser 应以 DELETE 调用 /user/del/10，id 拼在路径里' , async () => {
        request. mockResolvedValue ({ code : 200 , msg : '删除成功' }) 
        await delUser ( 10 ) 
        expect (request). toHaveBeenCalledWith ({ 
            url : '/user/del/10' , 
            method : 'delete' 
        })
    })
})