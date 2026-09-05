/**
 * Camada de apresentação do dashboard.
 *
 * Responsável por consumir os recursos disponibilizados pela API,
 * consolidar os indicadores operacionais e controlar o ciclo
 * de atualização dos chamados.
 */

const API_URL = "http://127.0.0.1:8000";


/**
 * Elementos principais da interface.
 */

const listaChamados =
    document.getElementById("lista-chamados");

const loading =
    document.getElementById("loading");

const erro =
    document.getElementById("erro");

const totalChamados =
    document.getElementById("total-chamados");

const chamadosAbertos =
    document.getElementById("chamados-abertos");

const chamadosAtendimento =
    document.getElementById("chamados-atendimento");

const chamadosResolvidos =
    document.getElementById("chamados-resolvidos");

const btnAtualizar =
    document.getElementById("btn-atualizar");


/**
 * Consulta os chamados disponíveis na API.
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


        const chamados =
            await response.json();


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
 * Atualiza os indicadores operacionais.
 */
function atualizarIndicadores(chamados) {

    totalChamados.textContent =
        chamados.length;


    chamadosAbertos.textContent =
        chamados.filter(
            chamado =>
                chamado.status === "aberto"
        ).length;


    chamadosAtendimento.textContent =
        chamados.filter(
            chamado =>
                chamado.status === "em_atendimento"
        ).length;


    chamadosResolvidos.textContent =
        chamados.filter(
            chamado =>
                chamado.status === "resolvido"
        ).length;

}


/**
 * Renderiza a lista de chamados.
 */
function renderizarChamados(chamados) {

    listaChamados.innerHTML = "";


    if (chamados.length === 0) {

        listaChamados.innerHTML = `
            <div class="empty-state">

                <h3>
                    Nenhum chamado registrado
                </h3>

                <p>
                    Os novos chamados aparecerão
                    automaticamente neste painel.
                </p>

            </div>
        `;

        return;

    }


    chamados.forEach(
        chamado => {

            const card =
                document.createElement("article");


            card.className =
                "ticket-card";


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

                    <span
                        class="status status-${chamado.status}"
                    >
                        ${formatarStatus(chamado.status)}
                    </span>

                </div>


                <div class="ticket-content">

                    <p>
                        <strong>Categoria:</strong>
                        ${formatarCategoria(
                            chamado.categoria
                        )}
                    </p>


                    <p>
                        <strong>Descrição:</strong>
                        ${chamado.descricao ||
                            "Não informada"}
                    </p>

                </div>


                <div class="ticket-footer">

                    <span>
                        Registrado em:
                        ${formatarData(
                            chamado.created_at
                        )}
                    </span>


                    <div class="ticket-actions">

                        ${renderizarAcoes(chamado)}

                    </div>

                </div>
            `;


            listaChamados.appendChild(card);

        }
    );


    registrarEventosStatus();

}


/**
 * Define as ações disponíveis de acordo com
 * o estado atual do chamado.
 */
function renderizarAcoes(chamado) {

    if (chamado.status === "aberto") {

        return `
            <button
                class="status-button"
                data-id="${chamado.id}"
                data-status="em_atendimento"
            >
                Assumir chamado
            </button>
        `;

    }


    if (chamado.status === "em_atendimento") {

        return `
            <button
                class="status-button"
                data-id="${chamado.id}"
                data-status="resolvido"
            >
                Marcar como resolvido
            </button>
        `;

    }


    return `
        <span class="resolved-label">
            Atendimento concluído
        </span>
    `;

}


/**
 * Registra os eventos dos controles de status.
 */
function registrarEventosStatus() {

    const botoes =
        document.querySelectorAll(
            ".status-button"
        );


    botoes.forEach(
        botao => {

            botao.addEventListener(
                "click",
                async () => {

                    const chamadoId =
                        botao.dataset.id;

                    const novoStatus =
                        botao.dataset.status;


                    await atualizarStatus(
                        chamadoId,
                        novoStatus
                    );

                }
            );

        }
    );

}


/**
 * Atualiza o status de um chamado através da API.
 */
async function atualizarStatus(
    chamadoId,
    novoStatus
) {

    try {

        const response = await fetch(
            `${API_URL}/chamados/${chamadoId}/status`,
            {

                method: "PATCH",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    status: novoStatus
                })

            }
        );


        if (!response.ok) {

            const errorData =
                await response.json();

            throw new Error(
                errorData.detail ||
                "Não foi possível atualizar o chamado."
            );

        }


        /*
         * Reconsulta o estado do backend após a alteração.
         *
         * Dessa forma, o frontend permanece orientado pelos
         * dados persistidos e não por uma cópia local do estado.
         */

        await carregarChamados();


    } catch (error) {

        console.error(
            "Erro ao atualizar status:",
            error
        );

        alert(
            "Não foi possível atualizar o status do chamado."
        );

    }

}


/**
 * Converte os identificadores internos dos status
 * para uma representação amigável.
 */
function formatarStatus(status) {

    const statusMap = {

        aberto: "Aberto",

        em_atendimento:
            "Em atendimento",

        resolvido:
            "Resolvido"

    };


    return statusMap[status] || status;

}


/**
 * Normaliza a apresentação das categorias.
 */
function formatarCategoria(categoria) {

    const categoriaMap = {

        projetor: "Projetor",

        internet: "Internet",

        iluminacao: "Iluminação",

        ar_condicionado:
            "Ar-condicionado",

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
 * Atualização manual do dashboard.
 */
btnAtualizar.addEventListener(
    "click",
    carregarChamados
);


/**
 * Inicialização da aplicação.
 */
carregarChamados();