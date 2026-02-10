// ===================================
// ENCURTADOR DE URL - JAVASCRIPT
// ===================================

// Configuração da API
const API_BASE_URL = window.location.origin;

// ===================================
// UTILITÁRIOS
// ===================================

/**
 * Exibe mensagem de alerta
 */
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const container = document.querySelector('.card-primary') || document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    // Remove após 5 segundos
    setTimeout(() => {
        alertDiv.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => alertDiv.remove(), 300);
    }, 5000);
}

/**
 * Valida URL
 */
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

/**
 * Copia texto para clipboard
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // Fallback para navegadores antigos
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        } catch (err) {
            document.body.removeChild(textArea);
            return false;
        }
    }
}

/**
 * Mostra loading overlay
 */
function showLoading() {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.id = 'loadingOverlay';
    overlay.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(overlay);
}

/**
 * Esconde loading overlay
 */
function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.remove();
    }
}

// ===================================
// PÁGINA PRINCIPAL - ENCURTAMENTO
// ===================================

/**
 * Inicializa a página de encurtamento
 */
function initShortenPage() {
    const form = document.getElementById('shortenForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const urlInput = document.getElementById('urlInput');
        const expiresInput = document.getElementById('expiresInput');
        const submitBtn = document.getElementById('submitBtn');
        const resultContainer = document.getElementById('resultContainer');
        
        const targetUrl = urlInput.value.trim();
        const expiresInDays = parseInt(expiresInput.value) || null;
        
        // Validação
        if (!targetUrl) {
            showAlert('Por favor, insira uma URL', 'error');
            return;
        }
        
        if (!isValidUrl(targetUrl)) {
            showAlert('Por favor, insira uma URL válida (deve começar com http:// ou https://)', 'error');
            return;
        }
        
        // Desabilita botão e mostra loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Encurtando...';
        
        try {
            const response = await fetch(`${API_BASE_URL}/shorten`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    target_url: targetUrl,
                    expires_in_days: expiresInDays
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Erro ao encurtar URL');
            }
            
            const data = await response.json();
            
            // Exibe resultado
            displayResult(data);
            
            // Limpa formulário
            urlInput.value = '';
            expiresInput.value = '7';
            
            showAlert('URL encurtada com sucesso! 🎉', 'success');
            
        } catch (error) {
            console.error('Erro:', error);
            showAlert(error.message || 'Erro ao encurtar URL. Tente novamente.', 'error');
        } finally {
            // Reabilita botão
            submitBtn.disabled = false;
            submitBtn.innerHTML = '✨ Encurtar URL';
        }
    });
}

/**
 * Exibe resultado do encurtamento
 */
function displayResult(data) {
    const resultContainer = document.getElementById('resultContainer');
    if (!resultContainer) return;
    
    const expiresText = data.expires_at 
        ? `<p class="text-secondary" style="font-size: 0.875rem; margin-top: 0.5rem;">Expira em: ${new Date(data.expires_at).toLocaleDateString('pt-BR')}</p>`
        : '';
    
    resultContainer.innerHTML = `
        <div class="result-container">
            <h3 style="color: var(--accent); margin-bottom: 1rem;">✅ URL Encurtada!</h3>
            
            <div class="result-url">
                <div class="result-link" id="shortUrl">${data.short_url}</div>
                <button class="btn btn-success" onclick="copyShortUrl('${data.short_url}')">
                    📋 Copiar
                </button>
            </div>
            
            ${expiresText}
            
            <div style="margin-top: 1rem;">
                <a href="${data.admin_url}" class="btn btn-secondary" style="text-decoration: none;">
                    📊 Ver Estatísticas
                </a>
            </div>
        </div>
    `;
    
    resultContainer.classList.remove('hidden');
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Copia URL encurtada
 */
async function copyShortUrl(url) {
    const success = await copyToClipboard(url);
    if (success) {
        showAlert('URL copiada para a área de transferência! 📋', 'success');
    } else {
        showAlert('Erro ao copiar URL. Tente copiar manualmente.', 'error');
    }
}

// ===================================
// PÁGINA DE ESTATÍSTICAS
// ===================================

/**
 * Inicializa a página de estatísticas
 */
function initStatsPage() {
    const form = document.getElementById('statsForm');
    if (!form) return;
    
    // Verifica se há código na URL
    const urlParams = new URLSearchParams(window.location.search);
    const shortCode = urlParams.get('code');
    
    if (shortCode) {
        document.getElementById('codeInput').value = shortCode;
        loadStats(shortCode);
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const codeInput = document.getElementById('codeInput');
        const code = codeInput.value.trim();
        
        if (!code) {
            showAlert('Por favor, insira um código', 'error');
            return;
        }
        
        await loadStats(code);
    });
}

/**
 * Carrega estatísticas
 */
async function loadStats(shortCode) {
    const submitBtn = document.querySelector('#statsForm button[type="submit"]');
    const statsContainer = document.getElementById('statsContainer');
    
    // Mostra loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Carregando...';
    statsContainer.innerHTML = '<div class="text-center"><div class="loading-spinner" style="margin: 2rem auto;"></div></div>';
    statsContainer.classList.remove('hidden');
    
    try {
        const response = await fetch(`${API_BASE_URL}/stats/${shortCode}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('URL não encontrada. Verifique o código e tente novamente.');
            }
            throw new Error('Erro ao carregar estatísticas');
        }
        
        const data = await response.json();
        displayStats(data, shortCode);
        
    } catch (error) {
        console.error('Erro:', error);
        showAlert(error.message || 'Erro ao carregar estatísticas', 'error');
        statsContainer.classList.add('hidden');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '📊 Ver Estatísticas';
    }
}

/**
 * Exibe estatísticas
 */
function displayStats(data, shortCode) {
    const statsContainer = document.getElementById('statsContainer');
    if (!statsContainer) return;
    
    // Card principal com total de cliques
    let html = `
        <div class="stat-card" style="grid-column: 1 / -1;">
            <div class="stat-value">${data.total_clicks}</div>
            <div class="stat-label">Total de Cliques</div>
            <p style="color: var(--text-muted); margin-top: 0.5rem; font-size: 0.875rem;">
                Código: <span style="color: var(--accent); font-weight: 600;">${shortCode}</span>
            </p>
        </div>
    `;
    
    // Navegadores
    if (data.browsers && Object.keys(data.browsers).length > 0) {
        html += `
            <div class="card-stats">
                <h3 style="margin-bottom: 1rem; font-size: 1.25rem;">🌐 Navegadores</h3>
                <ul class="stat-list">
                    ${Object.entries(data.browsers)
                        .sort((a, b) => b[1] - a[1])
                        .map(([browser, count]) => `
                            <li class="stat-item">
                                <span class="stat-item-label">${browser}</span>
                                <span class="stat-item-value">${count}</span>
                            </li>
                        `).join('')}
                </ul>
            </div>
        `;
    }
    
    // Sistemas Operacionais
    if (data.os && Object.keys(data.os).length > 0) {
        html += `
            <div class="card-stats">
                <h3 style="margin-bottom: 1rem; font-size: 1.25rem;">💻 Sistemas Operacionais</h3>
                <ul class="stat-list">
                    ${Object.entries(data.os)
                        .sort((a, b) => b[1] - a[1])
                        .map(([os, count]) => `
                            <li class="stat-item">
                                <span class="stat-item-label">${os}</span>
                                <span class="stat-item-value">${count}</span>
                            </li>
                        `).join('')}
                </ul>
            </div>
        `;
    }
    
    // Países
    if (data.countries && Object.keys(data.countries).length > 0) {
        html += `
            <div class="card-stats">
                <h3 style="margin-bottom: 1rem; font-size: 1.25rem;">🌍 Países</h3>
                <ul class="stat-list">
                    ${Object.entries(data.countries)
                        .sort((a, b) => b[1] - a[1])
                        .map(([country, count]) => `
                            <li class="stat-item">
                                <span class="stat-item-label">${country}</span>
                                <span class="stat-item-value">${count}</span>
                            </li>
                        `).join('')}
                </ul>
            </div>
        `;
    }
    
    statsContainer.innerHTML = `<div class="stats-grid">${html}</div>`;
    statsContainer.classList.remove('hidden');
}

// ===================================
// DASHBOARD
// ===================================

/**
 * Inicializa a página do dashboard
 */
async function initDashboard() {
    await loadDashboard();
}

/**
 * Carrega a lista de links para o dashboard
 */
async function loadDashboard() {
    const tableBody = document.getElementById('linksTableBody');
    const noLinksMessage = document.getElementById('noLinksMessage');
    const totalLinksEl = document.getElementById('totalLinks');
    const totalClicksEl = document.getElementById('totalClicksAll');
    
    if (!tableBody) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/links`);
        if (!response.ok) throw new Error('Erro ao carregar links');
        
        const data = await response.json();
        const links = data.links;
        
        // Atualiza stats
        totalLinksEl.textContent = data.total;
        const totalClicks = links.reduce((acc, link) => acc + link.clicks, 0);
        totalClicksEl.textContent = totalClicks;
        
        if (links.length === 0) {
            tableBody.closest('table').classList.add('hidden');
            noLinksMessage.classList.remove('hidden');
            return;
        }
        
        noLinksMessage.classList.add('hidden');
        tableBody.closest('table').classList.remove('hidden');
        
        tableBody.innerHTML = links.map(link => `
            <tr class="link-row">
                <td>
                    <div class="link-target" title="${link.target_url}">${link.target_url}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${new Date(link.created_at).toLocaleDateString('pt-BR')}</div>
                </td>
                <td>
                    <a href="${link.short_url}" class="link-short" target="_blank">${link.key}</a>
                </td>
                <td style="font-weight: 600;">${link.clicks}</td>
                <td>
                    <span class="status-badge ${link.is_active ? 'status-active' : 'status-inactive'}">
                        ${link.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                </td>
                <td>
                    <div class="action-btns">
                        <button class="btn btn-secondary btn-icon" onclick="copyShortUrl('${link.short_url}')" title="Copiar">
                            📋
                        </button>
                        <a href="/static/stats.html?code=${link.key}" class="btn btn-secondary btn-icon" title="Ver Estatísticas">
                            📊
                        </a>
                        ${link.is_active ? `
                            <button class="btn btn-secondary btn-icon" onclick="deactivateLink('${link.key}')" title="Desativar" style="color: #ef4444;">
                                🚫
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Erro:', error);
        showAlert('Erro ao carregar dados do dashboard', 'error');
    }
}

/**
 * Desativa um link
 */
async function deactivateLink(shortCode) {
    if (!confirm(`Deseja realmente desativar o link ${shortCode}? Esta ação não pode ser desfeita.`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/links/${shortCode}/deactivate`, {
            method: 'PATCH'
        });
        
        if (!response.ok) throw new Error('Erro ao desativar link');
        
        showAlert('Link desativado com sucesso!', 'success');
        await loadDashboard(); // Recarrega a lista
        
    } catch (error) {
        console.error('Erro:', error);
        showAlert('Erro ao desativar link', 'error');
    }
}

// ===================================
// INICIALIZAÇÃO
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa página apropriada
    if (document.getElementById('shortenForm')) {
        initShortenPage();
    }
    
    if (document.getElementById('statsForm')) {
        initStatsPage();
    }

    if (document.getElementById('linksTableBody')) {
        initDashboard();
    }
});

// Adiciona animação de fadeOut para alertas
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-10px); }
    }
`;
document.head.appendChild(style);
