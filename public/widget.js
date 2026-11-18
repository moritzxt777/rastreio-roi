(function() {
  function initRastreioWidget() {
    var container = document.getElementById('rastreio-widget');
    var script = document.currentScript || document.querySelector('script[src*="widget.js"]');
    
    if (!container && script && script.parentNode) {
      container = document.createElement('div');
      container.id = 'rastreio-widget';
      script.parentNode.insertBefore(container, script.nextSibling);
    }
    
    if (!container) return;

    var domain = (script && script.getAttribute('data-domain')) || 'https://roi-rastreio.site';
    var primaryColor = (script && script.getAttribute('data-color')) || '#3b82f6';
    var theme = (script && script.getAttribute('data-theme')) || 'dark';
    var title = (script && script.getAttribute('data-title')) || 'Rastreie seu Pedido';
    var subtitle = (script && script.getAttribute('data-subtitle')) || 'Digite seu código de rastreio para acompanhar a entrega.';
    var btnText = (script && script.getAttribute('data-btn-text')) || 'Rastrear Encomenda';
    var placeholder = (script && script.getAttribute('data-placeholder')) || 'Ex: NL192837465BR (ou nº do pedido)';

    var isDark = theme !== 'light';
    var bgCard = isDark ? '#090d16' : '#ffffff';
    var borderCard = isDark ? '#1e293b' : '#e2e8f0';
    var textTitle = isDark ? '#ffffff' : '#0f172a';
    var textSub = isDark ? '#94a3b8' : '#64748b';
    var bgInput = isDark ? '#020617' : '#f8fafc';
    var textInput = isDark ? '#f8fafc' : '#0f172a';
    var borderInput = isDark ? '#1e293b' : '#cbd5e1';

    var html = '' +
      '<div style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: ' + bgCard + '; border: 1px solid ' + borderCard + '; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2); text-align: center; box-sizing: border-box;">' +
        '<div style="width: 48px; height: 48px; border-radius: 12px; background: ' + primaryColor + '; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">' +
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>' +
        '</div>' +
        '<h3 style="margin: 0 0 6px 0; font-size: 18px; font-weight: 800; color: ' + textTitle + ';">' + title + '</h3>' +
        '<p style="margin: 0 0 20px 0; font-size: 12px; color: ' + textSub + '; line-height: 1.5;">' + subtitle + '</p>' +
        '<form id="rastreio-widget-form" style="display: flex; flex-direction: column; gap: 10px; margin: 0;">' +
          '<div style="position: relative;">' +
            '<input type="text" id="rastreio-widget-input" placeholder="' + placeholder + '" required style="width: 100%; box-sizing: border-box; padding: 12px 16px; background: ' + bgInput + '; border: 1px solid ' + borderInput + '; border-radius: 10px; color: ' + textInput + '; font-size: 13px; font-weight: 500; outline: none;">' +
          '</div>' +
          '<button type="submit" style="width: 100%; padding: 12px 20px; background: ' + primaryColor + '; color: #000000; border: none; border-radius: 10px; font-size: 13px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">' +
            btnText +
          '</button>' +
        '</form>' +
      '</div>';

    container.innerHTML = html;

    var form = document.getElementById('rastreio-widget-form');
    var input = document.getElementById('rastreio-widget-input');

    if (form && input) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        var code = (input.value || '').trim();
        if (!code) return;
        
        code = code.replace(/\s+/g, '').toUpperCase();
        var cleanDomain = domain.replace(/\/+$/, '');
        var targetUrl = cleanDomain + '/loggi/rastreamento/' + encodeURIComponent(code);

        if (code.indexOf('LP') === 0 || code.indexOf('CN') === 0) {
          targetUrl = cleanDomain + '/cainiao/rastreamento/' + encodeURIComponent(code);
        } else if (/^\d{10}$/.test(code) || code.indexOf('DHL') === 0) {
          targetUrl = cleanDomain + '/dhl/rastreamento/' + encodeURIComponent(code);
        } else if (code.indexOf('1008') === 0 || code.indexOf('JAD') === 0 || /^\d{12,14}$/.test(code)) {
          targetUrl = cleanDomain + '/jadlog/rastreamento/' + encodeURIComponent(code);
        } else if (code.indexOf('TEX') === 0 || code.indexOf('TOTAL') === 0) {
          targetUrl = cleanDomain + '/totalexpress/rastreamento/' + encodeURIComponent(code);
        } else if ((code.length === 13 && code.slice(-2) === 'BR' && code.indexOf('LG') !== 0) || code.indexOf('CORREIO') === 0) {
          targetUrl = cleanDomain + '/correios/rastreamento/' + encodeURIComponent(code);
        }
        
        window.open(targetUrl, '_blank');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRastreioWidget);
  } else {
    initRastreioWidget();
  }
})();