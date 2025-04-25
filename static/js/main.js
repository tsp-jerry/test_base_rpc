document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const testAllBtn = document.getElementById('test-all-btn');
    const clearResultsBtn = document.getElementById('clear-results-btn');
    const exportBtn = document.getElementById('export-btn');
    const copyFastestBtn = document.getElementById('copy-fastest-btn');
    const resultsBody = document.getElementById('results-body');
    const testedCount = document.getElementById('tested-count');
    const successCount = document.getElementById('success-count');
    const failedCount = document.getElementById('failed-count');
    const fastestNode = document.getElementById('fastest-node');
    const clientDetails = document.getElementById('client-details');
    
    // 存储测试结果
    let testResults = [];
    let clientInfo = {};
    
    // 初始化客户端信息
    initClientInfo();
    
    // 测试所有节点按钮点击事件
    testAllBtn.addEventListener('click', function() {
        testAllRpcNodes();
    });
    
    // 清除结果按钮点击事件
    clearResultsBtn.addEventListener('click', function() {
        clearResults();
    });
    
    // 导出结果按钮点击事件
    exportBtn.addEventListener('click', function() {
        exportResultsToCSV();
    });
    
    // 复制最快节点按钮点击事件
    copyFastestBtn.addEventListener('click', function() {
        copyFastestNodeUrl();
    });
    
    // 初始化客户端信息
    async function initClientInfo() {
        try {
            const response = await fetch('/test_all');
            const data = await response.json();
            
            clientInfo = data.client_info;
            
            // 显示客户端信息
            let clientHtml = '';
            clientHtml += `<div class="client-detail-item">IP: ${clientInfo.ip}</div>`;
            clientHtml += `<div class="client-detail-item">浏览器: ${getBrowserInfo(clientInfo.user_agent)}</div>`;
            clientHtml += `<div class="client-detail-item">操作系统: ${getOSInfo(clientInfo.user_agent)}</div>`;
            
            clientDetails.innerHTML = clientHtml;
            
            // 预填充RPC节点表格
            populateRpcTable(data.rpc_list);
        } catch (error) {
            console.error('获取客户端信息失败:', error);
            clientDetails.innerHTML = '获取客户端信息失败';
        }
    }
    
    // 填充RPC节点表格
    function populateRpcTable(rpcList) {
        resultsBody.innerHTML = '';
        
        rpcList.forEach(rpcUrl => {
            const row = document.createElement('tr');
            row.dataset.rpcUrl = rpcUrl;
            
            row.innerHTML = `
                <td><span class="status">未测试</span></td>
                <td>${rpcUrl}</td>
                <td>-</td>
                <td>-</td>
                <td>
                    <button class="btn primary test-single-btn" data-rpc="${rpcUrl}">测试</button>
                </td>
            `;
            
            resultsBody.appendChild(row);
        });
        
        // 为每个测试按钮添加点击事件
        document.querySelectorAll('.test-single-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const rpcUrl = this.dataset.rpc;
                testSingleRpcNode(rpcUrl);
            });
        });
    }
    
    // 测试所有RPC节点
    async function testAllRpcNodes() {
        // 重置计数器
        testedCount.textContent = '0';
        successCount.textContent = '0';
        failedCount.textContent = '0';
        fastestNode.textContent = '-';
        
        // 清空结果数组
        testResults = [];
        
        // 获取所有行
        const rows = resultsBody.querySelectorAll('tr');
        
        // 禁用测试按钮
        testAllBtn.disabled = true;
        testAllBtn.textContent = '测试中...';
        
        // 逐个测试节点
        for (const row of rows) {
            const rpcUrl = row.dataset.rpcUrl;
            await testSingleRpcNode(rpcUrl);
            
            // 短暂延迟，避免请求过于密集
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        // 启用测试按钮
        testAllBtn.disabled = false;
        testAllBtn.textContent = '测试所有节点';
        
        // 保存测试结果到服务器
        saveResultsToServer();
    }
    
    // 测试单个RPC节点
    async function testSingleRpcNode(rpcUrl) {
        // 找到对应的行
        const row = findRowByRpcUrl(rpcUrl);
        if (!row) return;
        
        // 更新状态为测试中
        const statusCell = row.querySelector('.status');
        statusCell.textContent = '测试中...';
        statusCell.className = 'status status-pending';
        
        try {
            const response = await fetch('/test_rpc', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ rpc_url: rpcUrl })
            });
            
            const data = await response.json();
            
            // 更新行数据
            if (data.success) {
                statusCell.textContent = '可用';
                statusCell.className = 'status status-success';
                row.querySelector('td:nth-child(3)').textContent = `${data.response_time} ms`;
                row.querySelector('td:nth-child(4)').textContent = data.block_number;
                
                // 添加到结果数组
                testResults.push({
                    rpcUrl: rpcUrl,
                    success: true,
                    responseTime: data.response_time,
                    blockNumber: data.block_number
                });
            } else {
                statusCell.textContent = '失败';
                statusCell.className = 'status status-error';
                row.querySelector('td:nth-child(3)').textContent = '-';
                row.querySelector('td:nth-child(4)').textContent = data.error || '未知错误';
                
                // 添加到结果数组
                testResults.push({
                    rpcUrl: rpcUrl,
                    success: false,
                    error: data.error || '未知错误'
                });
            }
            
            // 更新计数器
            updateCounters();
            
        } catch (error) {
            console.error(`测试 ${rpcUrl} 失败:`, error);
            
            statusCell.textContent = '错误';
            statusCell.className = 'status status-error';
            row.querySelector('td:nth-child(3)').textContent = '-';
            row.querySelector('td:nth-child(4)').textContent = '请求失败';
            
            // 添加到结果数组
            testResults.push({
                rpcUrl: rpcUrl,
                success: false,
                error: '请求失败'
            });
            
            // 更新计数器
            updateCounters();
        }
    }
    
    // 根据RPC URL查找表格行
    function findRowByRpcUrl(rpcUrl) {
        const rows = resultsBody.querySelectorAll('tr');
        for (const row of rows) {
            if (row.dataset.rpcUrl === rpcUrl) {
                return row;
            }
        }
        return null;
    }
    
    // 更新计数器
    function updateCounters() {
        const tested = testResults.length;
        const successful = testResults.filter(r => r.success).length;
        const failed = tested - successful;
        
        testedCount.textContent = tested;
        successCount.textContent = successful;
        failedCount.textContent = failed;
        
        // 找出最快的节点
        if (successful > 0) {
            const successfulResults = testResults.filter(r => r.success);
            successfulResults.sort((a, b) => a.responseTime - b.responseTime);
            const fastest = successfulResults[0];
            
            fastestNode.textContent = `${fastest.rpcUrl} (${fastest.responseTime} ms)`;
        } else {
            fastestNode.textContent = '无可用节点';
        }
    }
    
    // 清除结果
    function clearResults() {
        // 清空结果数组
        testResults = [];
        
        // 重置计数器
        testedCount.textContent = '0';
        successCount.textContent = '0';
        failedCount.textContent = '0';
        fastestNode.textContent = '-';
        
        // 重置表格
        const rows = resultsBody.querySelectorAll('tr');
        rows.forEach(row => {
            const statusCell = row.querySelector('.status');
            statusCell.textContent = '未测试';
            statusCell.className = 'status';
            
            row.querySelector('td:nth-child(3)').textContent = '-';
            row.querySelector('td:nth-child(4)').textContent = '-';
        });
    }
    
    // 导出结果为CSV
    function exportResultsToCSV() {
        if (testResults.length === 0) {
            alert('没有可导出的测试结果');
            return;
        }
        
        let csvContent = 'RPC URL,状态,响应时间 (ms),区块高度,错误信息\n';
        
        testResults.forEach(result => {
            const status = result.success ? '可用' : '失败';
            const responseTime = result.success ? result.responseTime : '';
            const blockNumber = result.success ? result.blockNumber : '';
            const error = result.success ? '' : result.error;
            
            csvContent += `"${result.rpcUrl}","${status}","${responseTime}","${blockNumber}","${error}"\n`;
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `base-rpc-test-results-${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // 复制最快节点URL
    function copyFastestNodeUrl() {
        if (testResults.length === 0) {
            alert('没有测试结果');
            return;
        }
        
        const successfulResults = testResults.filter(r => r.success);
        if (successfulResults.length === 0) {
            alert('没有可用节点');
            return;
        }
        
        successfulResults.sort((a, b) => a.responseTime - b.responseTime);
        const fastest = successfulResults[0];
        
        navigator.clipboard.writeText(fastest.rpcUrl)
            .then(() => {
                alert(`已复制最快节点 URL: ${fastest.rpcUrl}`);
            })
            .catch(err => {
                console.error('复制失败:', err);
                alert('复制失败，请手动复制');
            });
    }
    
    // 保存结果到服务器
    async function saveResultsToServer() {
        if (testResults.length === 0) return;
        
        try {
            await fetch('/save_results', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    results: testResults,
                    client_info: clientInfo
                })
            });
            
            console.log('测试结果已保存到服务器');
        } catch (error) {
            console.error('保存测试结果失败:', error);
        }
    }
    
    // 获取浏览器信息
    function getBrowserInfo(userAgent) {
        if (userAgent.includes('Firefox')) {
            return 'Firefox';
        } else if (userAgent.includes('Chrome')) {
            return 'Chrome';
        } else if (userAgent.includes('Safari')) {
            return 'Safari';
        } else if (userAgent.includes('Edge')) {
            return 'Edge';
        } else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) {
            return 'Internet Explorer';
        } else {
            return '未知浏览器';
        }
    }
    
    // 获取操作系统信息
    function getOSInfo(userAgent) {
        if (userAgent.includes('Windows')) {
            return 'Windows';
        } else if (userAgent.includes('Mac OS')) {
            return 'macOS';
        } else if (userAgent.includes('Linux')) {
            return 'Linux';
        } else if (userAgent.includes('Android')) {
            return 'Android';
        } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
            return 'iOS';
        } else {
            return '未知操作系统';
        }
    }
});