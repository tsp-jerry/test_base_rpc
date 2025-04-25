from flask import Flask, render_template, jsonify, request
import requests
import time
import os

app = Flask(__name__)

# Base 网络 RPC 节点列表
RPC_LIST = [
    "https://base.llamarpc.com", 
    "https://mainnet.base.org",
    "https://developer-access-mainnet.base.org",
    "https://base-mainnet.diamondswap.org/rpc",
    "https://base.blockpi.network/v1/rpc/public",
    "https://1rpc.io/base", 
    "https://base-pokt.nodies.app", 
    "https://base.meowrpc.com", 
    "https://base-mainnet.public.blastapi.io", 
    "https://base.gateway.tenderly.co",
    "https://gateway.tenderly.co/public/base",
    "https://rpc.notadegen.com/base",
    "https://base-rpc.publicnode.com",
    "https://base.drpc.org", 
    "https://base.api.onfinality.io/public",
    "https://public.stackup.sh/api/v1/node/base-mainnet",
    "https://base-mainnet.gateway.tatum.io",
    "https://base.rpc.subquery.network/public",
    "https://api.zan.top/base-mainnet",
    "https://endpoints.omniatech.io/v1/base/mainnet/public", 
    "https://base.lava.build",
    "https://rpc.numa.network/base",
    "https://node.histori.xyz/base-mainnet/8ry9f6t9dct1se2hlagxnd9n2a",
    "https://0xrpc.io/base"
]

@app.route('/')
def index():
    """渲染主页"""
    return render_template('index.html', rpc_list=RPC_LIST)

@app.route('/test_rpc', methods=['POST'])
def test_rpc():
    """测试单个 RPC 节点"""
    rpc_url = request.json.get('rpc_url')
    
    if not rpc_url:
        return jsonify({'success': False, 'error': '未提供 RPC URL'})
    
    payload = {
        "jsonrpc": "2.0",
        "method": "eth_blockNumber",
        "params": [],
        "id": 1
    }
    
    try:
        start_time = time.time()
        response = requests.post(rpc_url, json=payload, timeout=10)
        end_time = time.time()
        response_time_ms = round((end_time - start_time) * 1000, 2)  # 毫秒
        
        if response.status_code == 200:
            data = response.json()
            if "result" in data:
                block_number = int(data["result"], 16)  # 将十六进制转换为十进制
                return jsonify({
                    'success': True, 
                    'response_time': response_time_ms,
                    'block_number': block_number
                })
            else:
                return jsonify({'success': False, 'error': 'RPC 响应无效'})
        else:
            return jsonify({'success': False, 'error': f'HTTP 错误: {response.status_code}'})
    except requests.exceptions.Timeout:
        return jsonify({'success': False, 'error': '请求超时'})
    except requests.exceptions.ConnectionError:
        return jsonify({'success': False, 'error': '连接错误'})
    except Exception as e:
        return jsonify({'success': False, 'error': f'错误: {str(e)}'})

@app.route('/test_all', methods=['GET'])
def test_all():
    """测试所有 RPC 节点并返回结果"""
    client_ip = request.remote_addr
    user_agent = request.headers.get('User-Agent')
    
    return jsonify({
        'client_info': {
            'ip': client_ip,
            'user_agent': user_agent
        },
        'rpc_list': RPC_LIST
    })

@app.route('/save_results', methods=['POST'])
def save_results():
    """保存测试结果"""
    results = request.json.get('results')
    client_info = request.json.get('client_info')
    
    if not results or not client_info:
        return jsonify({'success': False, 'error': '数据不完整'})
    
    # 这里可以添加将结果保存到数据库或文件的代码
    # 简单起见，我们只返回成功消息
    return jsonify({'success': True})

if __name__ == '__main__':
    # 在生产环境中，应该使用 gunicorn 或 uwsgi 来运行
    # 这里为了简单，直接使用 Flask 内置服务器
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)