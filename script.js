document.addEventListener('DOMContentLoaded', function() {
    
    let todasCompetenciasGerais = [];
    let todasCompetenciasEspecificas = [];
    let todasHabilidades = [];

    carregarTodosOsDados();

    const modal = document.getElementById('modal-descricao');
    const modalTitulo = document.getElementById('modal-titulo');
    const modalTexto = document.getElementById('modal-texto');
    const modalCloseBtn = document.querySelector('.modal-close-btn');

    function fecharModal() {
        if (modal) modal.classList.remove('visible');
    }

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', fecharModal);
    if (modal) modal.addEventListener('click', (event) => {
        if (event.target === modal) fecharModal();
    });

    document.querySelector('main').addEventListener('click', function(event) {
        const cardClicado = event.target.closest('.card-item');
        if (cardClicado && modal) {
            const titulo = cardClicado.querySelector('span').textContent;
            const descricao = cardClicado.getAttribute('data-descricao');
            modalTitulo.textContent = titulo;
            modalTexto.textContent = descricao;
            modal.classList.add('visible');
        }
    });

    const btnBusca = document.getElementById('btn-busca');
    if (btnBusca) {
        btnBusca.addEventListener('click', buscarCorrelacoes);
    }
    
    function buscarCorrelacoes() {
        const termo = document.getElementById('input-busca').value.toLowerCase().trim();
        const resultadosContainer = document.getElementById('resultados-busca');
        resultadosContainer.innerHTML = '';

        if (!termo) {
            resultadosContainer.innerHTML = '<p>Por favor, digite um termo para buscar.</p>';
            return;
        }

        const habilidadesEncontradas = todasHabilidades.filter(hab => {
            const textoBusca = (hab.descricao + ' ' + (hab.palavras_chave || []).join(' ')).toLowerCase();
            return textoBusca.includes(termo);
        });

        if (habilidadesEncontradas.length === 0) {
            resultadosContainer.innerHTML = '<p>Nenhuma habilidade encontrada para este termo.</p>';
            return;
        }

        habilidadesEncontradas.forEach(hab => {
            const compEspec = todasCompetenciasEspecificas.find(ce => ce.codigo_competencia_especifica === hab.codigo_competencia_especifica_mae);
            const resultadoDiv = document.createElement('div');
            resultadoDiv.className = 'resultado-item';
            let htmlInterno = `<h4>Habilidade Encontrada: ${hab.codigo_habilidade}</h4>`;

            if (compEspec && compEspec.codigos_competencias_gerais_relacionadas) {
                htmlInterno += `<p><strong>Contribui para as Competências Gerais:</strong></p><ul>`;
                compEspec.codigos_competencias_gerais_relacionadas.forEach(cgCode => {
                    const compGeral = todasCompetenciasGerais.find(cg => cg.codigo_competencia_geral === cgCode);
                    if (compGeral) htmlInterno += `<li>${compGeral.numero}. ${compGeral.titulo_curto}</li>`;
                });
                htmlInterno += `</ul>`;
            }

            if (compEspec) {
                htmlInterno += `<p><strong>Relacionada à Competência Específica ${compEspec.numero}:</strong> ${compEspec.descricao}</p>`;
            }
            
            htmlInterno += `<hr><p><strong>Descrição da Habilidade (${hab.codigo_habilidade}):</strong> ${hab.descricao}</p>`;
            
            if (hab.afinidade_disciplinar_cnt) {
                htmlInterno += `<p><em>Afinidade Disciplinar: Biologia (${hab.afinidade_disciplinar_cnt.Biologia}), Física (${hab.afinidade_disciplinar_cnt.Fisica}), Química (${hab.afinidade_disciplinar_cnt.Quimica})</em></p>`;
            }
            resultadoDiv.innerHTML = htmlInterno;
            resultadosContainer.appendChild(resultadoDiv);
        });
    }

    async function carregarTodosOsDados() {
        try {
            const [respCG, respCE, respHab] = await Promise.all([
                fetch('./competencias_gerais.json'),
                fetch('./competencias_especificas_cnt_em.json'),
                fetch('./habilidades_cnt_em.json')
            ]);
            todasCompetenciasGerais = await respCG.json();
            todasCompetenciasEspecificas = await respCE.json();
            todasHabilidades = await respHab.json();
            renderizarCompetenciasGerais();
            renderizarCompetenciasEspecificasCNT();
            renderizarHabilidadesCNT();
        } catch (error) {
            console.error("Erro fatal ao carregar os dados da BNCC:", error);
            document.querySelector('main').innerHTML = `<p style="color: red; font-weight: bold; text-align: center;">Não foi possível carregar os dados da BNCC. Verifique se os arquivos .json estão na pasta correta e se você está usando o Live Server.</p>`;
        }
    }

    function renderizarCompetenciasGerais() {
        const container = document.getElementById('lista-competencias-gerais');
        if (!container) return;
        todasCompetenciasGerais.forEach(cg => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'card-item competencia-geral-item';
            itemDiv.setAttribute('data-descricao', cg.descricao);
            const icon = document.createElement('i');
            icon.className = cg.icone || 'fa-solid fa-star';
            const title = document.createElement('span');
            title.textContent = `${cg.numero}. ${cg.titulo_curto}`;
            itemDiv.appendChild(icon);
            itemDiv.appendChild(title);
            container.appendChild(itemDiv);
        });
    }

    function renderizarCompetenciasEspecificasCNT() {
        const container = document.getElementById('lista-competencias-especificas-cnt');
        if (!container) return;
        todasCompetenciasEspecificas.forEach(ce => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'card-item competencia-especifica-item';
            itemDiv.setAttribute('data-descricao', ce.descricao);
            const icon = document.createElement('i');
            icon.className = ce.icone || 'fa-solid fa-atom';
            const title = document.createElement('span');
            title.textContent = `Competência Específica ${ce.numero}`;
            itemDiv.appendChild(icon);
            itemDiv.appendChild(title);
            container.appendChild(itemDiv);
        });
    }

    function renderizarHabilidadesCNT() {
        const container = document.getElementById('lista-habilidades-cnt');
        if (!container) return;
        todasHabilidades.forEach(hab => {
            if (!hab.codigo_habilidade) return;
            const itemDiv = document.createElement('div');
            itemDiv.className = 'card-item habilidade-item';
            let descricaoCompleta = hab.descricao;
            if (hab.afinidade_disciplinar_cnt) {
                descricaoCompleta += `\n\nAfinidade Disciplinar: Biologia (${hab.afinidade_disciplinar_cnt.Biologia || 'N/A'}), Física (${hab.afinidade_disciplinar_cnt.Fisica || 'N/A'}), Química (${hab.afinidade_disciplinar_cnt.Quimica || 'N/A'})`;
            }
            itemDiv.setAttribute('data-descricao', descricaoCompleta);
            const icon = document.createElement('i');
            icon.className = hab.icone || 'fa-solid fa-bullseye';
            const title = document.createElement('span');
            title.textContent = hab.codigo_habilidade;
            itemDiv.appendChild(icon);
            itemDiv.appendChild(title);
            container.appendChild(itemDiv);
        });
    }
    
    const segmentosCodigo = document.querySelectorAll('.segmento-codigo');
    const todasExplicacoesCodigo = document.querySelectorAll('#explicacoes-container .explicacao-item');
    const explicacaoPlaceholder = document.getElementById('expl-placeholder');

    function mostrarExplicacaoCodigo(targetId) {
        todasExplicacoesCodigo.forEach(expl => expl.classList.remove('active'));
        const explicacaoAlvo = document.getElementById(targetId);
        if (explicacaoAlvo) explicacaoAlvo.classList.add('active');
    }

    if(explicacaoPlaceholder) mostrarExplicacaoCodigo('expl-placeholder');
    
    segmentosCodigo.forEach(segmento => {
        segmento.addEventListener('mouseover', () => mostrarExplicacaoCodigo(segmento.dataset.explicacaoId));
        segmento.addEventListener('mouseout', () => mostrarExplicacaoCodigo('expl-placeholder'));
    });
});