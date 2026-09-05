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

index.html?sala=1

O parâmetro identifica qual sala está
associada ao QR Code utilizado.
----------------------------------------------------
*/

const params =
    new URLSearchParams(
        window.location.search
    );


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

if (!salaId) {

    showMessage(
        "Sala não identificada.",
        "error"
    );

} else {

    carregarSala();

}


/*
----------------------------------------------------
CARREGAR DADOS DA SALA
----------------------------------------------------
*/

async function carregarSala() {

    try {

        const response = await fetch(
            `${API_URL}/salas/${salaId}`
        );


        if (!response.ok) {

            throw new Error(
                "Sala não encontrada."
            );

        }


        const sala =
            await response.json();


        /*
            Atualiza o nome da sala
            com o valor retornado pela API.
        */

        roomName.textContent =
            sala.nome;


        /*
            Monta a localização da sala.
        */

        let locationText =
            sala.bloco || "";


        if (sala.descricao) {

            if (locationText) {

                locationText += " · ";

            }

            locationText +=
                sala.descricao;

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
SELEÇÃO DA CATEGORIA
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
                    Destaca a opção selecionada.
                */

                option.classList.add(
                    "selected"
                );


                /*
                    Recupera a categoria definida
                    no atributo data-categoria.
                */

                selectedCategory =
                    option.dataset.categoria;


                clearMessage();

            }
        );

    }
);


/*
----------------------------------------------------
REGISTRO DO CHAMADO
----------------------------------------------------
*/

submitButton.addEventListener(
    "click",
    async function () {


        /*
            Valida a identificação da sala.
        */

        if (!salaId) {

            showMessage(
                "Não foi possível identificar a sala.",
                "error"
            );

            return;

        }


        /*
            Valida a seleção de categoria.
        */

        if (!selectedCategory) {

            showMessage(
                "Selecione o problema encontrado.",
                "error"
            );

            return;

        }


        /*
            Obtém a descrição informada.
        */

        const descriptionValue =
            description.value.trim();


        /*
            Bloqueia o botão durante a requisição
            para evitar envios duplicados.
        */

        submitButton.disabled = true;

        submitText.textContent =
            "Enviando...";


        try {

            /*
                Envia a ocorrência para a API.
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
                Trata respostas HTTP de erro.
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
                Obtém o recurso criado.
            */

            const data =
                await response.json();


            /*
                Confirma o registro para o usuário.
            */

            showMessage(
                `Problema registrado com sucesso! Chamado #${data.id}.`,
                "success"
            );


            /*
                Limpa o formulário.
            */

            description.value = "";

            selectedCategory = null;


            /*
                Remove a seleção visual.
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
                Libera novamente o botão.
            */

            submitButton.disabled = false;

            submitText.textContent =
                "Registrar problema";

        }

    }
);


/*
----------------------------------------------------
MENSAGENS DA INTERFACE
----------------------------------------------------
*/

function showMessage(
    text,
    type
) {

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