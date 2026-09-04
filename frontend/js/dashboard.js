/**
 * Camada de apresentação do dashboard.
 *
 * Responsável por consumir os dados disponibilizados pela API
 * e atualizar a interface de gerenciamento dos chamados.
 */

const API_URL = "http://127.0.0.1:8000";


/**
 * Elementos principais da interface.
 */
const listaChamados = document.getElementById("lista-chamados");
const loading = document.getElementById("loading");
const erro = document.getElementById("erro");

const totalChamados = document.getElementById("total-chamados");
const chamadosAbertos = document.getElementById("chamados-abertos");
const chamadosAtendimento =
    document.getElementById("chamados-atendimento");
const chamadosResolvidos =
    document.getElementById("chamados-resolvidos");

const btnAtualizar = document.getElementById("btn-atualizar");


/**
 * Carrega os chamados registrados através da API.
 */
async function carregarChamados() {

    loading.hidden = false;
    erro.hidden = true;

    try {

        const response = await fetch(
            `${API_URL}/chamados/`
        );

        if (!response.ok) {
            throw new Error(
                "Falha ao consultar os chamados."
            );
        }

        const chamados = await response.json();

        atualizarIndicadores(chamados);
        renderizarChamados(chamados);

    } catch (error) {

        console.error(
            "Erro ao carregar chamados:",
            error
        );

        erro.hidden = false;

    } finally {

        loading.hidden = true;
    }
}


/**
 * Atualiza os indicadores operacionais do dashboard.
 *
 * Os dados são derivados diretamente da coleção retornada
 * pela API, evitando estado duplicado no frontend.
 */
function atualizarIndicadores(chamados) {

    const total = chamados.length;

    const abertos = chamados.filter(
        chamado => chamado.status === "aberto"
    ).length;

    const atendimento = chamados.filter(
        chamado => chamado.status === "em_atendimento"
    ).length;

    const resolvidos = chamados.filter(
        chamado => chamado.status === "resolvido"
    ).length;


    totalChamados.textContent = total;
    chamadosAbertos.textContent = abertos;
    chamadosAtendimento.textContent = atendimento;
    chamadosResolvidos.textContent = resolvidos;
}


/**
 * Renderiza os chamados na interface.
 */
function renderizarChamados(chamados) {

    listaChamados.innerHTML = "";


    if (chamados.length === 0) {

        listaChamados.innerHTML = `
            <div class="empty-state">
                <h3>Nenhum chamado registrado</h3>

                <p>
                    Os novos chamados aparecerão
                    automaticamente neste painel.
                </p>
            </div>
        `;

        return;
    }


    chamados.forEach(chamado => {

        const card = document.createElement("article");

        card.className = "ticket-card";


        card.innerHTML = `
            <div class="ticket-header">

                <div>
                    <span class="ticket-id">
                        Chamado #${chamado.id}
                    </span>

                    <h3>
                        Sala ${chamado.sala_id}
                    </h3>
                </div>

                <span class="status status-${chamado.status}">
                    ${formatarStatus(chamado.status)}
                </span>

            </div>


            <div class="ticket-content">

                <p>
                    <strong>Categoria:</strong>
                    ${formatarCategoria(chamado.categoria)}
                </p>

                <p>
                    <strong>Descrição:</strong>
                    ${chamado.descricao || "Não informada"}
                </p>

            </div>


            <div class="ticket-footer">

                <span>
                    Registrado em:
                    ${formatarData(chamado.created_at)}
                </span>

            </div>
        `;


        listaChamados.appendChild(card);
    });
}


/**
 * Normaliza a apresentação dos status internos da API.
 */
function formatarStatus(status) {

    const statusMap = {
        aberto: "Aberto",
        em_atendimento: "Em atendimento",
        resolvido: "Resolvido"
    };

    return statusMap[status] || status;
}


/**
 * Converte identificadores técnicos das categorias
 * para uma apresentação amigável na interface.
 */
function formatarCategoria(categoria) {

    const categoriaMap = {
        projetor: "Projetor",
        internet: "Internet",
        iluminacao: "Iluminação",
        ar_condicionado: "Ar-condicionado",
        tomada: "Tomada",
        limpeza: "Limpeza",
        outro: "Outro"
    };

    return categoriaMap[categoria] || categoria;
}


/**
 * Formata timestamps retornados pela API.
 */
function formatarData(data) {

    return new Date(data).toLocaleString(
        "pt-BR",
        {
            dateStyle: "short",
            timeStyle: "short"
        }
    );
}


/**
 * Permite atualização manual dos dados exibidos.
 */
btnAtualizar.addEventListener(
    "click",
    carregarChamados
);


/**
 * Inicialização do dashboard.
 */
carregarChamados();