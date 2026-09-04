/*
====================================================
QR DA SALA
JavaScript da página de registro de problemas
====================================================
*/


/*
----------------------------------------------------
CONFIGURAÇÃO DA API
----------------------------------------------------
*/

const API_URL = "http://127.0.0.1:8000";


/*
----------------------------------------------------
ELEMENTOS DA PÁGINA
----------------------------------------------------
*/

const roomName =
    document.getElementById("room-name");

const roomLocation =
    document.getElementById("room-location");

const problemOptions =
    document.querySelectorAll(".problem-option");

const description =
    document.getElementById("description");

const submitButton =
    document.getElementById("submit-button");

const submitText =
    document.getElementById("submit-text");

const message =
    document.getElementById("message");


/*
----------------------------------------------------
IDENTIFICAÇÃO DA SALA PELA URL
----------------------------------------------------

Exemplo:

sala.html?sala=1

O código abaixo pega o número 1.

Isso será muito importante quando criarmos
os QR Codes.
*/

const params =
    new URLSearchParams(window.location.search);

const salaId =
    params.get("sala");


/*
----------------------------------------------------
CATEGORIA SELECIONADA
----------------------------------------------------
*/

let selectedCategory = null;


/*
----------------------------------------------------
VALIDAÇÃO DA SALA
----------------------------------------------------
*/

/*
    Se a URL não tiver o parâmetro "sala",
    não conseguimos saber qual sala mostrar.
*/

if (!salaId) {

    showMessage(
        "Sala não identificada.",
        "error"
    );

} else {

    /*
        Se temos o ID da sala,
        buscamos os dados na API.
    */

    carregarSala();

}


/*
----------------------------------------------------
CARREGAR SALA
----------------------------------------------------
*/

async function carregarSala() {

    try {

        /*
            Fazemos uma requisição:

            GET /salas/{id}

            Exemplo:

            GET /salas/1
        */

        const response = await fetch(
            `${API_URL}/salas/${salaId}`
        );


        /*
            Caso a API retorne erro,
            interrompemos o processo.
        */

        if (!response.ok) {

            throw new Error(
                "Sala não encontrada."
            );

        }


        /*
            Transformamos a resposta
            em objeto JavaScript.
        */

        const sala =
            await response.json();


        /*
            Atualizamos o nome da sala.
        */

        roomName.textContent =
            sala.nome;


        /*
            Montamos a localização.

            Exemplo:

            Bloco B · Laboratório de informática
        */

        let locationText =
            sala.bloco || "";


        if (sala.descricao) {

            if (locationText) {

                locationText += " · ";

            }

            locationText += sala.descricao;

        }


        roomLocation.textContent =
            locationText;


    } catch (error) {

        console.error(
            "Erro ao carregar sala:",
            error
        );


        roomName.textContent =
            "Sala não encontrada";


        roomLocation.textContent =
            "Verifique o QR Code utilizado";


        showMessage(
            "Não foi possível carregar os dados da sala.",
            "error"
        );

    }

}


/*
----------------------------------------------------
SELEÇÃO DO PROBLEMA
----------------------------------------------------
*/

problemOptions.forEach(
    function (option) {

        option.addEventListener(
            "click",
            function () {

                /*
                    Remove a seleção anterior.
                */

                problemOptions.forEach(
                    function (item) {

                        item.classList.remove(
                            "selected"
                        );

                    }
                );


                /*
                    Marca a opção clicada.
                */

                option.classList.add(
                    "selected"
                );


                /*
                    Guarda a categoria.

                    Exemplo:

                    projetor
                    internet
                    limpeza
                */

                selectedCategory =
                    option.dataset.categoria;


                /*
                    Remove mensagens anteriores.
                */

                clearMessage();

            }
        );

    }
);


/*
----------------------------------------------------
ENVIO DO CHAMADO
----------------------------------------------------
*/

submitButton.addEventListener(
    "click",
    async function () {

        /*
            Verificamos se existe uma sala.
        */

        if (!salaId) {

            showMessage(
                "Não foi possível identificar a sala.",
                "error"
            );

            return;

        }


        /*
            Verificamos se o usuário
            selecionou um problema.
        */

        if (!selectedCategory) {

            showMessage(
                "Selecione o problema encontrado.",
                "error"
            );

            return;

        }


        /*
            Pegamos a descrição.
        */

        const descriptionValue =
            description.value.trim();


        /*
            Alteramos o botão enquanto
            estamos enviando os dados.
        */

        submitButton.disabled = true;

        submitText.textContent =
            "Enviando...";


        try {

            /*
                Enviamos o chamado para a API.

                POST /chamados/
            */

            const response = await fetch(
                `${API_URL}/chamados/`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        /*
                            Aqui está a diferença
                            principal:

                            agora usamos o ID real
                            encontrado na URL.
                        */

                        sala_id:
                            Number(salaId),

                        categoria:
                            selectedCategory,

                        descricao:
                            descriptionValue || null

                    })

                }
            );


            /*
                Verificamos se a API retornou erro.
            */

            if (!response.ok) {

                const errorData =
                    await response.json();

                throw new Error(
                    errorData.detail ||
                    "Erro ao registrar chamado."
                );

            }


            /*
                Pegamos o chamado criado.
            */

            const data =
                await response.json();


            /*
                Mostramos confirmação.
            */

            showMessage(
                `Problema registrado com sucesso! Chamado #${data.id}.`,
                "success"
            );


            /*
                Limpamos o formulário.
            */

            description.value = "";

            selectedCategory = null;


            /*
                Removemos a seleção visual.
            */

            problemOptions.forEach(
                function (item) {

                    item.classList.remove(
                        "selected"
                    );

                }
            );


        } catch (error) {

            console.error(
                "Erro ao registrar chamado:",
                error
            );


            showMessage(
                "Não foi possível registrar o problema. Verifique se a API está funcionando.",
                "error"
            );

        } finally {

            /*
                Devolvemos o botão ao estado normal.
            */

            submitButton.disabled = false;

            submitText.textContent =
                "Registrar problema";

        }

    }
);


/*
----------------------------------------------------
MOSTRAR MENSAGEM
----------------------------------------------------
*/

function showMessage(text, type) {

    message.textContent =
        text;


    message.classList.remove(
        "success",
        "error"
    );


    message.classList.add(
        type
    );

}


/*
----------------------------------------------------
LIMPAR MENSAGEM
----------------------------------------------------
*/

function clearMessage() {

    message.textContent = "";


    message.classList.remove(
        "success",
        "error"
    );

}