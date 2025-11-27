// DRAG & DROP
const areaEnvio = document.getElementById("areaEnvio");
const inputExame = document.getElementById("envioExame");
const listaExames = document.getElementById("listaExames");

areaEnvio.addEventListener("click", () => inputExame.click());

inputExame.addEventListener("change", () => mostrarArquivos(inputExame.files));

["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
  areaEnvio.addEventListener(eventName, (e) => e.preventDefault());
});

areaEnvio.addEventListener("dragover", () => areaEnvio.classList.add("dragover"));
areaEnvio.addEventListener("dragleave", () => areaEnvio.classList.remove("dragover"));

areaEnvio.addEventListener("drop", (e) => {
  areaEnvio.classList.remove("dragover");
  mostrarArquivos(e.dataTransfer.files);
});

function mostrarArquivos(files) {
  listaExames.innerHTML = "";
  [...files].forEach(file => {
    listaExames.innerHTML += `<p>📄 ${file.name}</p>`;
  });
}

// ✅ FUNÇÃO SALVAR EXAME ATUALIZADA
async function salvarExame() {
  const idIdoso = document.getElementById("idIdoso").value;
  const nomeExame = document.getElementById("nomeExame").value;
  const categoria = document.getElementById("filtros").value;
  const dataExame = document.getElementById("dataExame").value;
  const infoAd = document.getElementById("infoAd").value;
  const arquivos = inputExame.files;

  console.log('Dados capturados:', { idIdoso, nomeExame, categoria, dataExame, infoAd, arquivos });

  if (!idIdoso || !nomeExame || !categoria || !dataExame || arquivos.length === 0) {
    alert("Preencha todos os campos obrigatórios e envie o arquivo do exame!");
    return;
  }

  try {
    const formData = new FormData();
    formData.append('idIdoso', idIdoso);
    formData.append('nomeExame', nomeExame);
    formData.append('categoria', categoria);
    formData.append('dataExame', dataExame);
    formData.append('infoAd', infoAd);
    
    // Adicionar todos os arquivos
    for (let i = 0; i < arquivos.length; i++) {
      formData.append('arquivos', arquivos[i]);
    }

    console.log('Enviando dados para o servidor...');

    const response = await fetch('/upload-exame', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    console.log('Resposta do servidor:', result);

    if (result.success) {
      alert("Exame enviado com sucesso!");
      // Limpar formulário
      document.getElementById('idIdoso').value = '';
      document.getElementById('nomeExame').value = '';
      document.getElementById('filtros').value = '';
      document.getElementById('dataExame').value = '';
      document.getElementById('infoAd').value = '';
      listaExames.innerHTML = "";
      inputExame.value = '';
    } else {
      alert("Erro ao enviar exame: " + result.message);
    }
  } catch (error) {
    console.error('Erro:', error);
    alert("Erro de conexão ao enviar exame!");
  }
}

// ✅ VERIFICAR SE O ARQUIVO FOI CARREGADO
console.log('✅ enviarExame.js carregado com sucesso!');
console.log('✅ Função salvarExame disponível:', typeof salvarExame);