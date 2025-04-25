import requests 
import time 
from tabulate import tabulate 
 
# 要测试的 RPC 节点列表 
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
 
def test_rpc(rpc_url):
    """测试单个 RPC 节点的可用性和响应时间"""
    payload = {
        "jsonrpc": "2.0",
        "method": "eth_blockNumber",
        "params": [],
        "id": 1 
    }
    try:
        start_time = time.time() 
        response = requests.post(rpc_url, json=payload, timeout=5)
        end_time = time.time() 
        response_time_ms = round((end_time - start_time) * 1000, 2)  # 毫秒 
        
        if response.status_code == 200:
            data = response.json() 
            if "result" in data:
                return True, response_time_ms 
            else:
                return False, "Invalid RPC Response"
        else:
            return False, f"HTTP {response.status_code}" 
    except Exception as e:
        return False, f"Error: {str(e)}"
 
def main():
    success_results = []
    failed_results = []
    print("🚀 开始测试 Base RPC 节点...")
    
    for rpc_url in RPC_LIST:
        print(f"🔍 正在测试: {rpc_url}")
        is_success, response_data = test_rpc(rpc_url)
        
        if is_success:
            success_results.append([rpc_url, f"{response_data} ms"])
        else:
            failed_results.append([rpc_url, response_data])
    
    # 按响应时间排序（成功节点）
    success_results.sort(key=lambda x: float(x[1].split()[0]))
    
    print("\n📊 **测试结果报告**")
    
    # 打印成功节点
    print("\n✅ **可用节点列表**")
    if success_results:
        success_table = tabulate(success_results, headers=["RPC URL", "响应时间"], tablefmt="grid")
        print(success_table)
        
        # 打印纯文本格式，方便复制
        print("\n📋 **可用节点 (纯文本格式，方便复制)**")
        for url, time in success_results:
            print(f"{url}")
    else:
        print("没有可用节点")
    
    # 打印失败节点
    print("\n❌ **不可用节点列表**")
    if failed_results:
        failed_table = tabulate(failed_results, headers=["RPC URL", "错误信息"], tablefmt="grid")
        print(failed_table)
    else:
        print("没有不可用节点")
    
    # 推荐最快节点
    if success_results:
        print("\n🏆 **推荐最快节点**")
        print(f"👉 {success_results[0][0]} ({success_results[0][1]})")
 
if __name__ == "__main__":
    main()