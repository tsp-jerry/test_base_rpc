# Base 网络 RPC 节点测试工具
这是一个用于测试 Base 网络 RPC 节点可用性和响应时间的工具。该工具提供了命令行和 Web 界面两种使用方式，可以帮助您找到最快、最稳定的 Base 网络 RPC 节点。

## 功能特点
- 测试多个 Base 网络 RPC 节点的可用性
- 测量每个节点的响应时间
- 显示节点返回的当前区块高度
- 根据响应时间推荐最快的节点
- 支持命令行和 Web 界面两种使用方式
- 记录用户的 IP 地址和浏览器信息（Web 界面）
## 项目结构
```plaintext
test_base_rpc/
├── app.py                # Web 应用主文件
├── test_base_rpc.py      # 命令行测试脚本
├── requirements.txt      # 依赖项
├── static/               # 静态资源
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── main.js
└── templates/            # HTML 模板
    └── index.html
 ```

## 安装依赖
在使用前，请先安装必要的依赖：

```bash
pip install -r requirements.txt
 ```

## 使用方法
### 命令行方式
直接运行 test_base_rpc.py 脚本：

```bash
python test_base_rpc.py
 ```

脚本将测试所有预设的 RPC 节点，并输出测试结果，包括可用节点列表、响应时间和推荐的最快节点。

### Web 界面方式
运行 Flask 应用：

```bash
python app.py
 ```

然后在浏览器中访问：

```plaintext
http://localhost:5000
 ```

Web 界面提供了更友好的交互方式，您可以：

- 测试所有节点
- 单独测试特定节点
- 查看测试结果的可视化展示
- 获取推荐的最快节点

## 部署到服务器
### 使用 Gunicorn 部署（Linux）
1. 安装 Gunicorn：
```bash
pip install gunicorn
 ```

2. 启动服务：
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
 ```
### 使用 Waitress 部署（Windows）
1. 安装 Waitress：
```bash
pip install waitress
 ```

2. 创建 server.py 文件：
```python
from waitress import serve
from app import app

if __name__ == '__main__':
    print("启动服务器在 http://0.0.0.0:5000")
    serve(app, host='0.0.0.0', port=5000)
 ```
 
3. 运行服务器：
```bash
python server.py
 ```

### 使用 Docker 部署
1. 创建 Dockerfile：
### 使用 Docker 部署
1. 创建 Dockerfile：
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5000

CMD ["python", "app.py"]
 ```

2. 构建并运行 Docker 镜像：
```bash
docker build -t base-rpc-tester .
docker run -p 5000:5000 base-rpc-tester
 ```

