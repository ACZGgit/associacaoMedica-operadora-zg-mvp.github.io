const urlBackend = 'https://convenioassociacaomedica.onrender.com';

const formInputs = document.getElementById("form-longin").querySelectorAll("input");
let email = formInputs[0];
let senha = formInputs[1];
const butonLogin = document.getElementById("buttonLogin");
const mensagemErro = document.getElementById("msg-erro");

butonLogin.addEventListener("click", onLogin);

async function onLogin(){
    try {

        if(!email.value || !senha.value)
            throw {mensagem: "preencha os campos do formulário"}

        let uriLogin = `${urlBackend}/login`;

        let headers = {
            'method': 'POST',
            'Content-Type': 'application/json'
        }

        let userCredencials = {
            email: email.value.toLowerCase(),
            senha: senha.value
        }

        let loginResponse;
        await fetch(uriLogin, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(userCredencials)
        }).then(res => res.json())
            .then(json => {
                loginResponse = json;
            })
            .catch(function (res) {
                console.log(res)
            });

        if(!loginResponse)
            throw {mensagem: "Status:500, servidor não respondeu, por favor tente mais tarde ou entre em contato com o time de suporte"};

        if (loginResponse.status === 200) {
            mensagemDeErroLogin(false);
            sessionStorage.setItem("logado", "yes");
            sessionStorage.setItem("tokenDeAcesso", `${loginResponse.tokenDeAcesso}`);

            setTimeout(redirecionaParaHomePage,500);

        } else {
            mensagemDeErroLogin(true, loginResponse.mensagem);
        }
    }catch (error){
        mensagemDeErroLogin(true, error.mensagem);
    }
}

function redirecionaParaHomePage(){
    window.location.href = "./index.html";
}

function mensagemDeErroLogin(ativacao, mensagem){
    if(ativacao) {
        mensagemErro.innerHTML = `<p style='color: red;'>${mensagem}</p>`;
        mensagemErro.style.display = "block";
        console.log(mensagem);
    }else{
        mensagemErro.style.display = "none";
    }
}
